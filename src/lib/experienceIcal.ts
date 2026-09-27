/**
 * One-off .ics for a single bookable experience session (confirmation emails / cancel page).
 */
import type { ExperienceSession } from "../data/conferenceTimeline";

const TZID = "Europe/Zurich";
const UID_DOMAIN = "alpsconference.com";
const VENUE = "Kultur & Kongresshaus Aarau, Schlossplatz, Aarau, Switzerland";

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

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Format a Date that was constructed in Zurich local wall time into `YYYYMMDDTHHMMSS`. */
function localStamp(date: Date) {
  // Session dates are Absolute instants; express them in Europe/Zurich for DTSTART.
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZID,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}${get("month")}${get("day")}T${get("hour")}${get("minute")}${get("second")}`;
}

function utcStamp(date = new Date()) {
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function escapeText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

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

export function buildSessionIcal(session: ExperienceSession, url?: string) {
  if (!session.start || !session.end) {
    throw new Error("Session has no start/end time.");
  }

  const stamp = utcStamp();
  const summary = session.personName
    ? `${session.title} — ${session.personName}`
    : session.title;
  const location = session.venue ? `${session.venue} · ${VENUE}` : VENUE;
  const description = [
    session.detail,
    "ALPS Conference 2026 experience booking.",
    url ? `More: ${url}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALPS Foundation//ALPS Conference 2026//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${escapeText(session.title)}`,
    `X-WR-CALNAME:${escapeText(session.title)}`,
    `X-WR-TIMEZONE:${TZID}`,
    ...VTIMEZONE,
    "BEGIN:VEVENT",
    `UID:booking-${session.id}@${UID_DOMAIN}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=${TZID}:${localStamp(session.start)}`,
    `DTEND;TZID=${TZID}:${localStamp(session.end)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `LOCATION:${escapeText(location)}`,
    ...(url ? [`URL;VALUE=URI:${url}`] : []),
    "CATEGORIES:ALPS Conference 2026",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export function icalFilename(session: ExperienceSession) {
  const slug = session.title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `alps-2026-${slug || "experience"}.ics`;
}
