/**
 * iCalendar (RFC 5545) feeds built from the same schedule data the site renders,
 * so a published change reaches every subscriber on their client's next refresh.
 */
import { EXPERIENCE_DAYS, EXPERIENCE_PORTRAITS } from "../data/experiences";
import { PROGRAM, type ProgramItem } from "../data/program";
import { getExperienceModalId } from "./experienceModal";
import { getPanelModalId } from "./panelModal";
import { getSpeakerModalId } from "./speakerModal";
import { withBase } from "./withBase";

export type CalendarFeed = "talks" | "experiences";

export const CALENDAR_FILES: Record<CalendarFeed, string> = {
  talks: "alps-2026-talks.ics",
  experiences: "alps-2026-experiences.ics",
};

const FEED_META: Record<CalendarFeed, { name: string; description: string }> = {
  talks: {
    name: "ALPS Conference 2026 · Talks",
    description:
      "Research talks, panel discussions and breaks of the ALPS Conference 2026 main track, 9–10 October 2026 at the Kultur & Kongresshaus Aarau.",
  },
  experiences: {
    name: "ALPS Conference 2026 · Experiences",
    description:
      "Art, sound, movement and connection running alongside the talks at the ALPS Conference 2026, 9–10 October 2026 in Aarau.",
  },
};

const TZID = "Europe/Zurich";
const UID_DOMAIN = "alpsconference.com";
const VENUE = "Kultur & Kongresshaus Aarau, Schlossplatz, Aarau, Switzerland";

/** Europe/Zurich rules, so clients that do not ship a tz database still place the events correctly. */
const VTIMEZONE = [
  "BEGIN:VTIMEZONE",
  `TZID:${TZID}`,
  "X-LIC-LOCATION:Europe/Zurich",
  "BEGIN:DAYLIGHT",
  "TZOFFSETFROM:+0100",
  "TZOFFSETTO:+0200",
  "TZNAME:CEST",
  "DTSTART:19700329T020000",
  "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
  "END:DAYLIGHT",
  "BEGIN:STANDARD",
  "TZOFFSETFROM:+0200",
  "TZOFFSETTO:+0100",
  "TZNAME:CET",
  "DTSTART:19701025T030000",
  "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
  "END:STANDARD",
  "END:VTIMEZONE",
];

type CalendarEvent = {
  uid: string;
  summary: string;
  /** `YYYY-MM-DD` of the schedule day the entry belongs to. */
  date: string;
  /** `HH:MM–HH:MM`; omitted for entries that run the whole day. */
  range?: { start: string; end: string };
  description?: string;
  location?: string;
  url?: string;
};

const RANGE = /^(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})$/;

function parseRange(time: string) {
  const match = RANGE.exec(time.trim());
  if (!match) return undefined;
  return { start: match[1].padStart(5, "0"), end: match[2].padStart(5, "0") };
}

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** `YYYY-MM-DD` plus whole days, still as `YYYYMMDD`. */
function shiftDate(date: string, days = 0) {
  const [year, month, day] = date.split("-").map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10).replace(/-/g, "");
}

function localStamp(date: string, time: string, days = 0) {
  return `${shiftDate(date, days)}T${time.replace(":", "")}00`;
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** RFC 5545 content lines are folded at 75 octets, continuations start with one space. */
function fold(line: string) {
  const encoder = new TextEncoder();
  if (encoder.encode(line).length <= 75) return line;

  const chunks: string[] = [];
  let current = "";
  let octets = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = chunks.length === 0 ? 75 : 74;
    if (octets + size > limit) {
      chunks.push(current);
      current = "";
      octets = 0;
    }
    current += char;
    octets += size;
  }
  chunks.push(current);
  return chunks.join("\r\n ");
}

function eventLines(event: CalendarEvent, stamp: string, sequence: number) {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${stamp}`,
    `LAST-MODIFIED:${stamp}`,
    `SEQUENCE:${sequence}`,
  ];

  if (event.range) {
    // An entry whose end lands before its start (the afterparty) runs past midnight.
    const overnight = event.range.end < event.range.start ? 1 : 0;
    lines.push(`DTSTART;TZID=${TZID}:${localStamp(event.date, event.range.start)}`);
    lines.push(`DTEND;TZID=${TZID}:${localStamp(event.date, event.range.end, overnight)}`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${shiftDate(event.date)}`);
    lines.push(`DTEND;VALUE=DATE:${shiftDate(event.date, 1)}`);
    lines.push("TRANSP:TRANSPARENT");
  }

  lines.push(`SUMMARY:${escapeText(event.summary)}`);
  if (event.description) lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeText(event.location)}`);
  if (event.url) lines.push(`URL;VALUE=URI:${event.url}`);
  lines.push("CATEGORIES:ALPS Conference 2026");
  lines.push("END:VEVENT");
  return lines;
}

function describe(parts: (string | undefined)[], url?: string) {
  const lines = parts.filter((part): part is string => Boolean(part));
  if (url) lines.push(`More: ${url}`);
  return lines.length ? lines.join("\n") : undefined;
}

function talkEvents(home: string): CalendarEvent[] {
  return PROGRAM.flatMap((day) =>
    day.items.map((item: ProgramItem) => {
      const titled = Boolean(item.detail) && Boolean(item.speakerName || item.panel);
      const url = item.speakerName
        ? `${home}#${getSpeakerModalId(item.speakerName)}`
        : item.panel
          ? `${home}#${getPanelModalId(item.panel)}`
          : item.experienceName
            ? `${home}#${getExperienceModalId(item.experienceName)}`
            : `${home}#program`;

      return {
        uid: `talks-${day.dateTime}-${slug(item.time)}-${slug(item.title)}@${UID_DOMAIN}`,
        date: day.dateTime,
        range: parseRange(item.time),
        summary: titled ? `${item.title} — ${item.detail}` : item.title,
        description: describe([titled ? undefined : item.detail, item.menuNote], url),
        location: item.calendarLocation ?? item.venue ?? VENUE,
        url,
      };
    })
  );
}

function experienceEvents(home: string): CalendarEvent[] {
  return EXPERIENCE_DAYS.flatMap((day) =>
    day.items.flatMap((item) => {
      // "11:00–12:00 & 14:30–15:30" is one card on the site but two entries in a calendar.
      const times = item.time.split(" & ");
      const people = item.credits?.map((credit) => `${credit.name} — ${credit.type ?? ""}`.replace(/ — $/, ""))
        ?? item.personNames
        ?? (item.personName && item.personName !== item.title ? [item.personName] : []);
      // Only facilitators with a card of their own have a modal to deep-link into.
      const modalName = item.personName ?? item.title;
      const hasModal = Boolean(EXPERIENCE_PORTRAITS[modalName]) || modalName === "Afterparty";
      const url = hasModal ? `${home}#${getExperienceModalId(modalName)}` : `${home}#experiences`;

      return times.map((time, index) => ({
        uid: `experiences-${day.dateTime}-${slug(item.title)}-${index}@${UID_DOMAIN}`,
        date: day.dateTime,
        range: parseRange(time),
        summary: people.length === 1 && people[0] !== item.title
          ? `${item.title} — ${people[0]}`
          : item.title,
        description: describe([people.length > 1 ? people.join("\n") : undefined, item.detail], url),
        location: item.calendarLocation ?? (item.venue ? `${item.venue} · ${VENUE}` : VENUE),
        url,
      }));
    })
  );
}

/** Monotonic across builds, so a re-import of a downloaded file supersedes the older copy. */
function buildSequence(builtAt: Date) {
  return Math.floor((builtAt.getTime() - Date.UTC(2026, 0, 1)) / 60_000);
}

export function buildCalendar(feed: CalendarFeed, site: URL | undefined, builtAt = new Date()) {
  const origin = site?.href ?? "https://alpsconference.com/";
  const home = new URL(withBase(""), origin).href;
  const meta = FEED_META[feed];
  const stamp = `${builtAt.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`;
  const sequence = buildSequence(builtAt);
  const events = feed === "talks" ? talkEvents(home) : experienceEvents(home);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALPS Foundation//ALPS Conference 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${escapeText(meta.name)}`,
    `X-WR-CALNAME:${escapeText(meta.name)}`,
    `DESCRIPTION:${escapeText(meta.description)}`,
    `X-WR-CALDESC:${escapeText(meta.description)}`,
    `X-WR-TIMEZONE:${TZID}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    `SOURCE;VALUE=URI:${new URL(withBase(CALENDAR_FILES[feed]), origin).href}`,
    ...VTIMEZONE,
    ...events.flatMap((event) => eventLines(event, stamp, sequence)),
    "END:VCALENDAR",
  ];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}
