/**
 * Build crew (unloading, setup, teardown, packing the truck) shared by the /volunteers
 * page, the calendar feeds and the /api/crew-build routes. Content lives in
 * src/data/crewBuild.ts; who signed up and what is ticked lives in D1 (CREW_DB).
 */
import {
  BUILD_ITEM_START,
  BUILD_PHASES,
  BUILD_SECTIONS,
  BUILD_ZONE_GROUPS,
  BUILD_ZONES,
  type BuildItem,
  type BuildPhase,
  type BuildSection,
} from "../data/crewBuild";
import { CATERING_SHIFTS, type CateringShift } from "../data/volunteers";

export type BuildAssignment = { task_id: string; person: string; phase: BuildPhase; created_at?: string };
export type BuildTick = { task_id: string; phase: BuildPhase; done_at: string; by: string | null };
export type BuildState = {
  /** Names added on the page by people who are not in the plan. */
  added: string[];
  assignments: BuildAssignment[];
  ticks: BuildTick[];
  generated_at: string;
};

export const PHASE_ORDER: BuildPhase[] = ["unload", "setup", "teardown", "load"];

/** The build parts shown on each day tab. */
export const BUILD_DAYS: Record<string, BuildPhase[]> = {
  "2026-10-08": ["unload", "setup"],
  "2026-10-10": ["teardown", "load"],
};

export type PlacedItem = BuildItem & { section: BuildSection };

/** Task sections of a phase; teardown mirrors setup in reverse order. */
export function taskSections(phase: BuildPhase): BuildSection[] {
  const source = phase === "teardown" ? "setup" : phase;
  const sections = BUILD_SECTIONS.filter((section) => section.kind === "task" && section.phase === source);
  return phase === "teardown"
    ? sections.map((section) => ({ ...section, items: [...section.items].reverse() })).reverse()
    : sections;
}

/** The material checklist, ticked on arrival (unload) and when it is back on the truck (load). */
export function materialSections(phase: BuildPhase): BuildSection[] {
  return phase === "unload" || phase === "load" ? BUILD_SECTIONS.filter((section) => section.kind === "material") : [];
}

const ITEMS = new Map<string, PlacedItem>(
  BUILD_SECTIONS.flatMap((section) => section.items.map((item) => [item.id, { ...item, section }] as const))
);

export function buildItem(id: string) {
  return ITEMS.get(id) ?? null;
}

/** Whether people can sign up for, or tick, `id` in `phase`. */
export function itemAllows(id: string, phase: BuildPhase, action: "assign" | "tick") {
  const item = ITEMS.get(id);
  if (!item) return false;
  if (item.section.kind === "material") return action === "tick" && (phase === "unload" || phase === "load");
  const home = item.section.phase;
  return home === "setup" ? phase === "setup" || phase === "teardown" : phase === home;
}

export function zoneOf(n: string) {
  return BUILD_ZONES.find((zone) => zone.n === n) ?? null;
}

export function zoneGroupKey(n: string) {
  return BUILD_ZONE_GROUPS[zoneOf(n)?.group ?? ""] ?? "other";
}

export function assigneesOf(state: BuildState | null, id: string, phase: BuildPhase) {
  return (state?.assignments ?? []).filter((a) => a.task_id === id && a.phase === phase).map((a) => a.person);
}

/** When the teardown work starts, after the 21:00 circle. */
export const TEARDOWN_WORK_START = "21:15";

/** The catering shift someone is on while the teardown runs, if any. They are flagged and not counted. */
export function teardownCatering(person: string): CateringShift | undefined {
  const day = BUILD_PHASES.teardown.dateTime;
  return CATERING_SHIFTS.filter((s) => s.person === person && s.dateTime === day && s.to > TEARDOWN_WORK_START).sort(
    (a, b) => b.to.localeCompare(a.to),
  )[0];
}

/** Who is on a task: the sign-ups, and for the teardown also whoever set it up and is not on catering then. */
export function crewOf(state: BuildState | null, id: string, phase: BuildPhase) {
  const signed = assigneesOf(state, id, phase);
  if (phase !== "teardown") return signed;
  const setup = assigneesOf(state, id, "setup").filter((name) => !signed.includes(name) && !teardownCatering(name));
  return [...signed, ...setup];
}

export function tickOf(state: BuildState | null, id: string, phase: BuildPhase) {
  return (state?.ticks ?? []).find((t) => t.task_id === id && t.phase === phase) ?? null;
}

/** People needed; teardown uses the setup headcount, since the same work is undone. */
export function neededFor(item: BuildItem) {
  return item.people ?? null;
}

export type PersonBuildEntry = {
  phase: BuildPhase;
  dateTime: string;
  /** Minutes after midnight; null when the time is still to be confirmed. */
  start: number | null;
  end: number | null;
  items: PlacedItem[];
};

const minutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** What one person signed up for, one entry per build part, in time order. */
export function personBuild(state: BuildState | null, person: string): PersonBuildEntry[] {
  return PHASE_ORDER.flatMap((phase) => {
    const ids = (state?.assignments ?? []).filter((a) => a.person === person && a.phase === phase).map((a) => a.task_id);
    const items = [...new Set(ids)].map((id) => ITEMS.get(id)).filter((item): item is PlacedItem => Boolean(item));
    if (!items.length) return [];
    const info = BUILD_PHASES[phase];
    const starts = items.map((item) => BUILD_ITEM_START[item.id] ?? info.start).filter((t): t is string => Boolean(t));
    const start = starts.length ? Math.min(...starts.map(minutes)) : null;
    const end = info.end ? minutes(info.end) : start !== null ? start + (info.calendarMinutes ?? 60) : null;
    return [{ phase, dateTime: info.dateTime, start, end, items }];
  });
}
