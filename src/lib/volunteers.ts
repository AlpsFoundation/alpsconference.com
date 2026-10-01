/**
 * Shift logic shared by the /volunteers page and the per-person calendar feeds.
 */
import {
  CATERING_SHIFTS,
  CREW_EVENTS,
  CREW_ROLES,
  SHIFT_DAYS,
  TEAM_PHOTOS,
  VOLUNTEER_TASK_ORDER,
  VOLUNTEER_TASKS,
  type CateringShift,
  type CrewEvent,
  type ShiftDay,
  type VolunteerTask,
} from "../data/volunteers";
import { BUILD_PEOPLE } from "../data/crewBuild";
import { withBase } from "./withBase";

export type ShiftPart = { task: VolunteerTask; start: number; end: number };

/** Back-to-back slots of one person merged into a single shift. */
export type ShiftBlock = {
  day: ShiftDay;
  start: number;
  end: number;
  parts: ShiftPart[];
  /** Program items running at some point during the shift. */
  program: string[];
};

export function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function formatTime(minutes: number) {
  const whole = Math.round(minutes);
  return `${String(Math.floor(whole / 60)).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
}

export function formatDuration(minutes: number) {
  const whole = Math.round(minutes);
  const hours = Math.floor(whole / 60);
  const rest = whole % 60;
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
}

export function volunteerSlug(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Everyone on the crew: shift grid, catering team, roles, loading and unloading lists, and the build crew. */
export const CREW: string[] = [
  ...new Set([
    ...SHIFT_DAYS.flatMap((day) =>
      day.slots.flatMap((slot) => VOLUNTEER_TASK_ORDER.flatMap((task) => slot[task]))
    ),
    ...CATERING_SHIFTS.map((shift) => shift.person),
    ...CREW_ROLES.flatMap((role) => role.people),
    ...CREW_EVENTS.flatMap((event) => event.people ?? []),
    ...BUILD_PEOPLE,
  ]),
].sort((a, b) => a.localeCompare(b, "en"));

export const CREW_TEAM = CREW.filter((name) => name in TEAM_PHOTOS);
export const CREW_VOLUNTEERS = CREW.filter((name) => !(name in TEAM_PHOTOS));

/** Booklet portrait of a team member, when we know which one is theirs. */
export function teamPhoto(name: string) {
  const photo = TEAM_PHOTOS[name];
  return photo ? withBase(`img/booklet/team/${photo}.jpg`) : null;
}

const BY_SLUG = new Map(CREW.map((name) => [volunteerSlug(name), name]));

/** Names people added on the page to sign up for the build (from the build database). */
export function registerAddedPeople(names: string[]) {
  for (const name of names) {
    const slug = volunteerSlug(name);
    if (slug && !BY_SLUG.has(slug)) BY_SLUG.set(slug, name);
  }
}

export function volunteerFromSlug(slug: string | null | undefined) {
  return (slug && BY_SLUG.get(slug)) || null;
}

export function volunteerCalendarPath(name: string) {
  return withBase(`volunteers/${volunteerSlug(name)}.ics`);
}

/** Program item on stage in each slot: the grid only names it where it starts. */
export function slotPrograms(day: ShiftDay) {
  let current = "";
  return day.slots.map((slot) => {
    if (slot.program) current = slot.program;
    return current;
  });
}

export function shiftBlocks(day: ShiftDay, person: string): ShiftBlock[] {
  const programs = slotPrograms(day);
  const blocks: ShiftBlock[] = [];

  day.slots.forEach((slot, index) => {
    const start = toMinutes(slot.from);
    const end = toMinutes(slot.to);
    for (const task of VOLUNTEER_TASK_ORDER) {
      if (!slot[task].includes(person)) continue;

      const last = blocks[blocks.length - 1];
      if (last && last.end === start) {
        last.end = end;
        const part = last.parts[last.parts.length - 1];
        if (part.task === task && part.end === start) part.end = end;
        else last.parts.push({ task, start, end });
      } else {
        blocks.push({ day, start, end, parts: [{ task, start, end }], program: [] });
      }

      const block = blocks[blocks.length - 1];
      if (programs[index] && !block.program.includes(programs[index])) block.program.push(programs[index]);
    }
  });

  return blocks;
}

export function blockTasks(block: ShiftBlock) {
  return [...new Set(block.parts.map((part) => part.task))];
}

export function blockMinutes(blocks: ShiftBlock[]) {
  return blocks.reduce((sum, block) => sum + block.end - block.start, 0);
}

/** Hours as the plan counts them: see `COUNTING_RULE`. */
export function countedMinutes(blocks: ShiftBlock[]) {
  return blocks.reduce(
    (sum, block) =>
      sum + block.parts.reduce((part, p) => part + (p.end - p.start) * VOLUNTEER_TASKS[p.task].weight, 0),
    0
  );
}

export function crewEventsFor(person: string | null): CrewEvent[] {
  return CREW_EVENTS.filter((event) => !event.people || (person !== null && event.people.includes(person)));
}

export function crewEventEnd(event: CrewEvent) {
  return toMinutes(event.start) + event.calendarMinutes;
}

/** Every day with crew work, from loading on the Thursday to unloading on the Sunday. */
export type PlanDay = { dateTime: string; shiftDay?: ShiftDay; crew: CrewEvent[] };

export const PLAN_DAYS: PlanDay[] = [
  ...new Set([...SHIFT_DAYS.map((day) => day.dateTime), ...CREW_EVENTS.map((event) => event.dateTime)]),
]
  .sort()
  .map((dateTime) => ({
    dateTime,
    shiftDay: SHIFT_DAYS.find((day) => day.dateTime === dateTime),
    crew: CREW_EVENTS.filter((event) => event.dateTime === dateTime),
  }));

export function rolesFor(person: string) {
  return CREW_ROLES.filter((role) => role.people.includes(person)).map((role) => role.role);
}

export function cateringFor(person: string): CateringShift[] {
  return CATERING_SHIFTS.filter((shift) => shift.person === person);
}

/** One catering station at one time, with everyone on it. */
export type CateringRow = { from: string; to: string; station: string; people: string[] };

export function cateringRows(dateTime: string): CateringRow[] {
  const rows = new Map<string, CateringRow>();
  for (const shift of CATERING_SHIFTS) {
    if (shift.dateTime !== dateTime) continue;
    const key = `${shift.from}|${shift.to}|${shift.station}`;
    const row = rows.get(key) ?? { from: shift.from, to: shift.to, station: shift.station, people: [] };
    row.people.push(shift.person);
    rows.set(key, row);
  }
  return [...rows.values()]
    .map((row) => ({ ...row, people: row.people.sort((a, b) => a.localeCompare(b, "en")) }))
    .sort(
      (a, b) =>
        toMinutes(a.from) - toMinutes(b.from) || toMinutes(a.to) - toMinutes(b.to) || a.station.localeCompare(b.station)
    );
}

/** Days with a catering plan, each shown in its own schedule tab. */
export const CATERING_DAYS: string[] = [...new Set(CATERING_SHIFTS.map((shift) => shift.dateTime))].sort();
