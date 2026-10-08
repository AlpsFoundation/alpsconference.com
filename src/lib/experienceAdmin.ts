/**
 * Staff operations on experience bookings, for tools.alps.foundation/experiences.
 * Exposed only through the `ExperienceBookings` RPC entrypoint in src/worker.ts.
 */
import {
  EXPERIENCE_SESSIONS,
  SIGNUPS_OPEN,
  findSignupSession,
  type ExperienceSession,
} from "../data/conferenceTimeline";
import {
  cleanEmail,
  cleanFullName,
  emailKey,
  insertSignup,
  releaseSpot,
  resultFor,
  sendConfirmationEmail,
  type SignupRuntimeEnv,
  type SignupStatus,
  type WaitUntil,
} from "./experienceSignups";

export type AdminBooking = {
  signupId: number;
  fullName: string;
  /** Empty for desk bookings made without an address. */
  email: string;
  status: SignupStatus;
  /** 1-based place on the waitlist, only set when `status` is "waitlist". */
  waitlistPosition?: number;
  createdAt: string;
  checkedInAt: string | null;
  /** Staff member who added it at the desk; null when booked on /links. */
  addedBy: string | null;
};

export type AdminSession = {
  id: string;
  title: string;
  day: string;
  date: string;
  time: string;
  venue?: string;
  personName?: string;
  capacity: number;
  start?: string;
  end?: string;
  /** When /links starts taking bookings (ISO). It stops at `start`. */
  signupsOpenAt: string;
  bookings: AdminBooking[];
};

export type AdminResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

type BookingRow = {
  id: number;
  experience_id: string;
  full_name: string;
  email: string;
  created_at: string;
  checked_in_at: string | null;
  added_by: string | null;
};

const SIGNUP_SESSIONS = EXPERIENCE_SESSIONS.filter((s) => s.signup).sort(
  (a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0),
);

function toAdminSession(session: ExperienceSession, rows: BookingRow[]): AdminSession {
  return {
    id: session.id,
    title: session.title,
    day: session.day,
    date: session.date,
    time: session.time,
    venue: session.venue,
    personName: session.personName,
    capacity: session.capacity,
    start: session.start?.toISOString(),
    end: session.end?.toISOString(),
    signupsOpenAt: SIGNUPS_OPEN.toISOString(),
    // Rows arrive ordered by id: the first `capacity` are confirmed, the rest wait.
    bookings: rows.map((row, index) => ({
      signupId: row.id,
      fullName: row.full_name,
      email: row.email,
      ...(index < session.capacity
        ? { status: "confirmed" as const }
        : { status: "waitlist" as const, waitlistPosition: index - session.capacity + 1 }),
      createdAt: row.created_at,
      checkedInAt: row.checked_in_at,
      addedBy: row.added_by,
    })),
  };
}

const SELECT_BOOKINGS = `SELECT id, experience_id, full_name, email, created_at, checked_in_at, added_by
  FROM experience_signups`;

export async function listSessions(db: D1Database): Promise<AdminSession[]> {
  const { results } = await db.prepare(`${SELECT_BOOKINGS} ORDER BY id`).all<BookingRow>();
  const byExperience = new Map<string, BookingRow[]>();
  for (const row of results) {
    byExperience.set(row.experience_id, [...(byExperience.get(row.experience_id) ?? []), row]);
  }
  return SIGNUP_SESSIONS.map((session) => toAdminSession(session, byExperience.get(session.id) ?? []));
}

export async function getSession(db: D1Database, experienceId: string): Promise<AdminSession | null> {
  const session = findSignupSession(experienceId);
  if (!session) return null;
  const { results } = await db
    .prepare(`${SELECT_BOOKINGS} WHERE experience_id = ? ORDER BY id`)
    .bind(experienceId)
    .all<BookingRow>();
  return toAdminSession(session, results);
}

export type AddBookingInput = {
  experienceId: string;
  fullName: string;
  /** Optional: without one, nobody is emailed and the booking can only be removed by staff. */
  email?: string;
  addedBy: string;
};

/**
 * Books someone at the desk: confirmed while there is space, else on the waitlist.
 * Unlike /links, it ignores the sign-up window and session start, so staff can
 * seat people before sign-ups open or add walk-ins at the door.
 */
export async function addBooking(
  env: SignupRuntimeEnv,
  origin: string,
  input: AddBookingInput,
  waitUntil: WaitUntil,
): Promise<AdminResult<{ signupId: number; status: SignupStatus; waitlistPosition?: number }>> {
  const session = findSignupSession(input.experienceId);
  if (!session) return { ok: false, error: "This experience does not take sign-ups." };

  const fullName = cleanFullName(input.fullName);
  if (!fullName) return { ok: false, error: "Enter the person's full name." };
  const rawEmail = input.email?.trim() ?? "";
  const email = rawEmail ? cleanEmail(rawEmail) : "";
  if (email === null) return { ok: false, error: "That email address doesn't look right." };

  const inserted = await insertSignup(env.DB, {
    experienceId: session.id,
    fullName,
    email,
    // Unique per booking when there is no address, so several walk-ins can be added.
    emailKey: email ? emailKey(email) : `desk-${crypto.randomUUID()}`,
    addedBy: input.addedBy,
  });
  if (!inserted) return { ok: false, error: `${email} is already booked for this session.` };

  const result = await resultFor(env.DB, session.id, inserted.id);
  if (email) {
    waitUntil(sendConfirmationEmail(env, origin, {
      fullName,
      email,
      session,
      result,
      cancelToken: inserted.cancelToken,
    }));
  }
  return { ok: true, signupId: inserted.id, status: result.status, waitlistPosition: result.waitlistPosition };
}

export async function removeBooking(
  env: SignupRuntimeEnv,
  origin: string,
  signupId: number,
  waitUntil: WaitUntil,
): Promise<AdminResult> {
  const row = await env.DB
    .prepare("SELECT id, experience_id FROM experience_signups WHERE id = ?")
    .bind(signupId)
    .first<{ id: number; experience_id: string }>();
  if (!row || !(await releaseSpot(env, origin, row, waitUntil))) {
    return { ok: false, error: "That booking no longer exists." };
  }
  return { ok: true };
}

export async function setCheckedIn(db: D1Database, signupId: number, checkedIn: boolean): Promise<AdminResult> {
  const { meta } = await db
    .prepare(
      `UPDATE experience_signups
       SET checked_in_at = CASE WHEN ? THEN COALESCE(checked_in_at, strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) END
       WHERE id = ?`,
    )
    .bind(checkedIn ? 1 : 0, signupId)
    .run();
  return meta.changes ? { ok: true } : { ok: false, error: "That booking no longer exists." };
}
