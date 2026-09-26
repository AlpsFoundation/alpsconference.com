import { EXPERIENCE_SESSIONS, findSignupSession } from "../data/conferenceTimeline";

export type SignupStatus = "confirmed" | "waitlist";

export type SignupAvailability = Record<
  string,
  { capacity: number; confirmed: number; waitlist: number }
>;

export type SignupResult = {
  experienceId: string;
  signupId: number;
  status: SignupStatus;
  /** 1-based place on the waitlist, only set when `status` is "waitlist". */
  waitlistPosition?: number;
};

const MAX_NAME_LENGTH = 60;

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function errorResponse(message: string, status: number): Response {
  return json({ error: message }, status);
}

function cleanName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name || name.length > MAX_NAME_LENGTH || !/\p{L}/u.test(name)) return null;
  return name;
}

function nameKey(first: string, last: string): string {
  return `${first}|${last}`.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

async function resultFor(db: D1Database, experienceId: string, signupId: number): Promise<SignupResult> {
  const capacity = findSignupSession(experienceId)?.capacity ?? 0;
  const row = await db
    .prepare("SELECT COUNT(*) AS position FROM experience_signups WHERE experience_id = ? AND id <= ?")
    .bind(experienceId, signupId)
    .first<{ position: number }>();
  const position = row?.position ?? 0;
  return position <= capacity
    ? { experienceId, signupId, status: "confirmed" }
    : { experienceId, signupId, status: "waitlist", waitlistPosition: position - capacity };
}

export async function getAvailability(db: D1Database): Promise<SignupAvailability> {
  const { results } = await db
    .prepare("SELECT experience_id, COUNT(*) AS total FROM experience_signups GROUP BY experience_id")
    .all<{ experience_id: string; total: number }>();
  const totals = new Map(results.map((r) => [r.experience_id, r.total]));

  return Object.fromEntries(
    EXPERIENCE_SESSIONS.filter((s) => s.signup).map((s) => {
      const total = totals.get(s.id) ?? 0;
      return [s.id, {
        capacity: s.capacity,
        confirmed: Math.min(total, s.capacity),
        waitlist: Math.max(0, total - s.capacity),
      }];
    }),
  );
}

export async function handleSignup(db: D1Database, request: Request): Promise<Response> {
  const body = await readJson(request);
  if (!body) return errorResponse("Invalid request.", 400);
  // Honeypot field, hidden from people.
  if (typeof body.company === "string" && body.company.trim()) {
    return errorResponse("Invalid request.", 400);
  }

  const experienceId = typeof body.experienceId === "string" ? body.experienceId : "";
  const session = findSignupSession(experienceId);
  if (!session) return errorResponse("This experience does not take sign-ups.", 404);
  if (session.start && Date.now() >= session.start.getTime()) {
    return errorResponse("Sign-up for this session has closed.", 409);
  }

  const firstName = cleanName(body.firstName);
  const lastName = cleanName(body.lastName);
  if (!firstName || !lastName) {
    return errorResponse("Please enter your first and last name.", 400);
  }

  const key = nameKey(firstName, lastName);
  const cancelToken = crypto.randomUUID();
  const inserted = await db
    .prepare(
      `INSERT INTO experience_signups (experience_id, first_name, last_name, name_key, cancel_token)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (experience_id, name_key) DO NOTHING
       RETURNING id`,
    )
    .bind(experienceId, firstName, lastName, key, cancelToken)
    .first<{ id: number }>();

  if (!inserted) {
    // Same name already signed up: report their place, but never hand out their cancel token.
    const existing = await db
      .prepare("SELECT id FROM experience_signups WHERE experience_id = ? AND name_key = ?")
      .bind(experienceId, key)
      .first<{ id: number }>();
    if (!existing) return errorResponse("Something went wrong, please try again.", 500);
    return json({ ...(await resultFor(db, experienceId, existing.id)), alreadySignedUp: true });
  }

  return json({ ...(await resultFor(db, experienceId, inserted.id)), cancelToken }, 201);
}

type OwnSignup = { signupId: number; cancelToken: string };

function parseOwnSignups(value: unknown): OwnSignup[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (s): s is OwnSignup =>
        s && Number.isInteger(s.signupId) && typeof s.cancelToken === "string",
    )
    .slice(0, 50);
}

/** Current status of the signups this browser holds tokens for (waitlist promotions included). */
export async function handleOwnStatus(db: D1Database, request: Request): Promise<Response> {
  const body = await readJson(request);
  const signups = parseOwnSignups(body?.signups);
  const results: SignupResult[] = [];

  for (const { signupId, cancelToken } of signups) {
    const row = await db
      .prepare("SELECT experience_id FROM experience_signups WHERE id = ? AND cancel_token = ?")
      .bind(signupId, cancelToken)
      .first<{ experience_id: string }>();
    if (row) results.push(await resultFor(db, row.experience_id, signupId));
  }

  return json({ signups: results });
}

export async function handleCancel(db: D1Database, request: Request): Promise<Response> {
  const body = await readJson(request);
  const [signup] = parseOwnSignups(body ? [body] : []);
  if (!signup) return errorResponse("Invalid request.", 400);

  const { meta } = await db
    .prepare("DELETE FROM experience_signups WHERE id = ? AND cancel_token = ?")
    .bind(signup.signupId, signup.cancelToken)
    .run();
  if (!meta.changes) return errorResponse("Sign-up not found.", 404);
  return json({ cancelled: true });
}
