/**
 * D1 side of the build crew: the `conf26-setup` database, bound as CREW_DB.
 * Tables (from the tools-conf26-setup migrations): people, assignments, ticks.
 * Anyone with the link can sign up and tick, as on the rest of /volunteers.
 */
import { itemAllows, type BuildAssignment, type BuildState, type BuildTick } from "./crewBuild";
import type { BuildPhase } from "../data/crewBuild";
import { CREW, volunteerSlug } from "./volunteers";

const PHASES = new Set<BuildPhase>(["unload", "setup", "teardown", "load"]);

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const buildError = (message: string, status = 400) => json({ error: message }, status);

/**
 * Runs a handler against CREW_DB. A missing binding or a failing database answers 503 with a
 * JSON error, so the page can pause sign-ups instead of getting an HTML error page.
 */
export async function withCrewDb(db: D1Database | undefined, handler: (db: D1Database) => Promise<Response>) {
  if (!db) return buildError("The build database is not configured.", 503);
  try {
    return await handler(db);
  } catch (error) {
    console.error("crew build: database unavailable", error);
    return buildError("The build database can’t be reached right now.", 503);
  }
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** A first name as typed: collapsed spaces, letters required, short. */
export function cleanPersonName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/\s+/g, " ").trim().slice(0, 40);
  if (name.length < 2 || !/\p{L}/u.test(name) || /^U[A-Z0-9]{8,}$/.test(name) || /[<>@]/.test(name)) return null;
  return name;
}

const cleanId = (value: unknown) => (typeof value === "string" ? value.trim().slice(0, 80) : "");
const cleanPhase = (value: unknown) => (PHASES.has(value as BuildPhase) ? (value as BuildPhase) : null);

export async function buildState(db: D1Database): Promise<BuildState> {
  const [people, assignments, ticks] = await Promise.all([
    db.prepare("SELECT name FROM people WHERE source = 'added' ORDER BY name COLLATE NOCASE").all<{ name: string }>(),
    db.prepare("SELECT task_id, person, phase, created_at FROM assignments ORDER BY created_at").all<BuildAssignment>(),
    db.prepare("SELECT task_id, phase, done_at, by FROM ticks").all<BuildTick>(),
  ]);
  const known = new Set(CREW);
  return {
    added: people.results.map((row) => row.name).filter((name) => !known.has(name)),
    assignments: assignments.results,
    ticks: ticks.results,
    generated_at: new Date().toISOString(),
  };
}

/** An added name for a calendar slug, when it is not already a crew member. */
export async function addedPersonForSlug(db: D1Database, slug: string): Promise<string | null> {
  const rows = await db.prepare("SELECT name FROM people WHERE source = 'added'").all<{ name: string }>();
  return rows.results.map((row) => row.name).find((name) => volunteerSlug(name) === slug) ?? null;
}

export async function handleBuildState(db: D1Database) {
  return json(await buildState(db));
}

export async function handleAddPerson(db: D1Database, request: Request) {
  const name = cleanPersonName((await readBody(request)).name);
  if (!name) return buildError("Please type a first name.");
  if (!CREW.includes(name)) {
    await db.prepare("INSERT OR IGNORE INTO people (name, source) VALUES (?1, 'added')").bind(name).run();
  }
  return json({ ok: true, name });
}

export async function handleAssign(db: D1Database, request: Request) {
  const body = await readBody(request);
  const id = cleanId(body.task_id);
  const person = cleanPersonName(body.person);
  const phase = cleanPhase(body.phase);
  if (!id || !person || !phase) return buildError("task_id, person and phase are required.");
  if (!itemAllows(id, phase, "assign")) return buildError("Nobody signs up for that item in that part of the build.");
  if (body.on === false) {
    await db.prepare("DELETE FROM assignments WHERE task_id = ?1 AND person = ?2 AND phase = ?3").bind(id, person, phase).run();
  } else {
    const statements = [db.prepare("INSERT OR IGNORE INTO assignments (task_id, person, phase) VALUES (?1, ?2, ?3)").bind(id, person, phase)];
    if (!CREW.includes(person)) {
      statements.push(db.prepare("INSERT OR IGNORE INTO people (name, source) VALUES (?1, 'added')").bind(person));
    }
    await db.batch(statements);
  }
  return json({ ok: true });
}

export async function handleTick(db: D1Database, request: Request) {
  const body = await readBody(request);
  const id = cleanId(body.task_id);
  const phase = cleanPhase(body.phase);
  const by = cleanPersonName(body.by);
  if (!id || !phase) return buildError("task_id and phase are required.");
  if (!itemAllows(id, phase, "tick")) return buildError("That item cannot be ticked in that part of the build.");
  if (body.done === false) {
    await db.prepare("DELETE FROM ticks WHERE task_id = ?1 AND phase = ?2").bind(id, phase).run();
  } else {
    await db
      .prepare(
        "INSERT INTO ticks (task_id, phase, by) VALUES (?1, ?2, ?3) ON CONFLICT(task_id, phase) DO UPDATE SET done_at = datetime('now'), by = excluded.by"
      )
      .bind(id, phase, by)
      .run();
  }
  return json({ ok: true });
}
