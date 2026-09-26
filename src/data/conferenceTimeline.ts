/**
 * Clock-aware view of the conference: the talk timeline behind "Now / Next up"
 * on /links, and the bookable experience sessions shared with the signup API.
 */
import { PROGRAM } from "./program";
import { EXPERIENCE_DAYS } from "./experiences";
import { EXPERIENCES } from "./experienceProfiles";

/** Aarau is on CEST (UTC+2) for the whole conference — the switch to CET is on 25 October. */
const ZURICH_OFFSET = "+02:00";

export const DEFAULT_EXPERIENCE_CAPACITY = 30;

/** Per-session capacity overrides, keyed by session id (see `sessionId`). */
const CAPACITY_OVERRIDES: Record<string, number> = {};

/** Experiences that are open to everyone and need no sign-up. */
const DROP_IN_TITLES = new Set(["Art exhibitions", "Live concert", "Afterparty"]);

export function zurichDate(date: string, time: string): Date {
  return new Date(`${date}T${time}:00${ZURICH_OFFSET}`);
}

/** Parses "08:00–09:00" on a given day; an end before the start rolls over to the next day. */
function parseRange(date: string, range: string): { start: Date; end: Date } | null {
  const match = range.match(/(\d{1,2}:\d{2})\s*[–-]\s*(\d{1,2}:\d{2})/);
  if (!match) return null;
  const pad = (t: string) => t.padStart(5, "0");
  const start = zurichDate(date, pad(match[1]));
  let end = zurichDate(date, pad(match[2]));
  if (end <= start) end = new Date(end.getTime() + 86_400_000);
  return { start, end };
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shortDay(day: string, date: string): string {
  return `${day.slice(0, 3)} ${date.replace(/ October$/, " Oct")}`;
}

export type TimelineEntry = {
  id: string;
  day: string;
  title: string;
  detail?: string;
  venue?: string;
  menuNote?: string;
  kind: "session" | "pause" | "social";
  start: Date;
  end: Date;
};

export const TIMELINE: TimelineEntry[] = PROGRAM.flatMap((day) =>
  day.items.flatMap((item, index) => {
    const range = parseRange(day.dateTime, item.time);
    if (!range) return [];
    return [{
      id: `${day.dateTime}-${index}`,
      day: shortDay(day.day, day.date),
      title: item.title,
      detail: item.detail,
      venue: item.venue,
      menuNote: item.menuNote,
      kind: item.kind ?? "session",
      ...range,
    }];
  }),
).sort((a, b) => a.start.getTime() - b.start.getTime());

export type ExperienceSession = {
  id: string;
  day: string;
  date: string;
  time: string;
  title: string;
  personName?: string;
  venue?: string;
  detail?: string;
  description?: string;
  /** False for drop-in experiences (all-day art, the concert, the afterparty). */
  signup: boolean;
  capacity: number;
  start?: Date;
  end?: Date;
};

function findDescription(personName: string | undefined, title: string): string | undefined {
  if (!personName) return undefined;
  const person = EXPERIENCES.flatMap((category) => category.people).find(
    (p) => p.name === personName || p.aliases?.includes(personName),
  );
  const sessions = person?.sessions ?? [];
  const wanted = title.toLowerCase();
  const match = sessions.find((s) => {
    const candidate = s.title.toLowerCase();
    return candidate.includes(wanted) || wanted.includes(candidate);
  });
  return (match ?? sessions[0])?.description;
}

export function sessionId(date: string, title: string, time: string): string {
  return `${date}-${slugify(title)}-${time.replace(":", "")}`;
}

/** Every experience slot, one entry per time slot ("11:00–12:00 & 14:30–15:30" becomes two). */
export const EXPERIENCE_SESSIONS: ExperienceSession[] = EXPERIENCE_DAYS.flatMap((day) =>
  day.items.flatMap((item) => {
    const base = {
      day: shortDay(day.day, day.date),
      date: day.dateTime,
      title: item.title,
      personName: item.personName === "Afterparty" ? undefined : item.personName,
      venue: item.venue,
      detail: item.detail,
      description: findDescription(item.personName, item.title),
      signup: item.kind !== "allday" && !DROP_IN_TITLES.has(item.title),
    };

    if (item.kind === "allday") {
      return [{ ...base, id: sessionId(day.dateTime, item.title, "allday"), time: "All day", capacity: 0 }];
    }

    return item.time.split("&").flatMap((slot) => {
      const time = slot.trim();
      const range = parseRange(day.dateTime, time);
      if (!range) return [];
      const id = sessionId(day.dateTime, item.title, time.slice(0, 5));
      return [{
        ...base,
        id,
        time,
        capacity: base.signup ? CAPACITY_OVERRIDES[id] ?? DEFAULT_EXPERIENCE_CAPACITY : 0,
        ...range,
      }];
    });
  }),
);

export function findSignupSession(id: string): ExperienceSession | undefined {
  return EXPERIENCE_SESSIONS.find((session) => session.id === id && session.signup);
}

export const CONFERENCE_START = TIMELINE[0].start;
export const CONFERENCE_END = TIMELINE[TIMELINE.length - 1].end;

export type ConferenceState =
  | { phase: "before"; next: TimelineEntry }
  | { phase: "live"; current: TimelineEntry; next?: TimelineEntry }
  | { phase: "between"; next: TimelineEntry }
  | { phase: "after" };

export function getConferenceState(now: Date): ConferenceState {
  const t = now.getTime();
  if (t < CONFERENCE_START.getTime()) return { phase: "before", next: TIMELINE[0] };
  if (t >= CONFERENCE_END.getTime()) return { phase: "after" };

  const current = TIMELINE.find((e) => e.start.getTime() <= t && t < e.end.getTime());
  const next = TIMELINE.find((e) => e.start.getTime() > t && e !== current);
  if (current) return { phase: "live", current, next };
  return { phase: "between", next: next! };
}

/** Timed experiences running at `now`, e.g. a sound meditation during a talk. */
export function getActiveExperiences(now: Date): ExperienceSession[] {
  const t = now.getTime();
  return EXPERIENCE_SESSIONS.filter(
    (s) => s.start && s.end && s.start.getTime() <= t && t < s.end.getTime(),
  );
}

/** Parses the `?time=yyyy-mm-dd-hh-mm` time-travel parameter as Aarau local time. */
export function parseTimeTravel(value: string | null): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d, hh, mm] = match;
  const date = zurichDate(`${y}-${m}-${d}`, `${hh}:${mm}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
