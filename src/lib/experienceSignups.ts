import {
  EXPERIENCE_SESSIONS,
  SIGNUPS_OPEN,
  SIGNUPS_OPEN_LABEL,
  findSignupSession,
  parseTimeTravel,
} from "../data/conferenceTimeline";
import { sendBookingEmail, type MailerEnv } from "./bookingMailer";
import { buildSessionIcal, icalFilename } from "./experienceIcal";
import { buildSignupConfirmationEmail } from "./experienceSignupEmail";
import { withBase } from "./withBase";

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

export type SignupRuntimeEnv = MailerEnv & { DB: D1Database };

/** Keeps the Worker alive for work that finishes after the response, like sending email. */
export type WaitUntil = (promise: Promise<unknown>) => void;

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 254;

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

export function cleanFullName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name || name.length > MAX_NAME_LENGTH || !/\p{L}/u.test(name)) return null;
  return name;
}

export function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.normalize("NFC").trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function emailKey(email: string): string {
  return email.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

async function readJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export async function resultFor(db: D1Database, experienceId: string, signupId: number): Promise<SignupResult> {
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

function siteOrigin(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

function bookingUrls(origin: string, cancelToken: string) {
  const cancelPath = withBase(`links/cancel?token=${encodeURIComponent(cancelToken)}`);
  const icalPath = withBase(`api/experience-signups/ical?token=${encodeURIComponent(cancelToken)}`);
  return {
    cancelUrl: new URL(cancelPath, origin).href,
    icalUrl: new URL(icalPath, origin).href,
  };
}

export async function sendConfirmationEmail(
  env: SignupRuntimeEnv,
  origin: string,
  params: {
    fullName: string;
    email: string;
    session: NonNullable<ReturnType<typeof findSignupSession>>;
    result: Pick<SignupResult, "status" | "waitlistPosition">;
    cancelToken: string;
    promoted?: boolean;
  },
) {
  const { cancelUrl, icalUrl } = bookingUrls(origin, params.cancelToken);
  const content = buildSignupConfirmationEmail({
    fullName: params.fullName,
    session: params.session,
    status: params.result.status,
    waitlistPosition: params.result.waitlistPosition,
    promoted: params.promoted,
    cancelUrl,
    icalUrl,
  });

  const ics = buildSessionIcal(params.session, icalUrl);

  try {
    await sendBookingEmail(env, {
      to: params.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
      attachments: [
        {
          filename: icalFilename(params.session),
          mimeType: "text/calendar; charset=utf-8; method=PUBLISH",
          content: ics,
        },
      ],
    });
  } catch (error) {
    // Booking is already saved — don't fail the request if delivery hiccups.
    console.error("experience signup email failed", error);
  }
}

/** Emails whoever a cancelled confirmed spot moved up from the waitlist. */
async function notifyPromotion(env: SignupRuntimeEnv, origin: string, experienceId: string) {
  const session = findSignupSession(experienceId);
  if (!session || (session.start && Date.now() >= session.start.getTime())) return;

  const promoted = await env.DB
    .prepare(
      `SELECT full_name, email, cancel_token FROM experience_signups
       WHERE experience_id = ? ORDER BY id LIMIT 1 OFFSET ?`,
    )
    .bind(experienceId, session.capacity - 1)
    .first<{ full_name: string; email: string; cancel_token: string }>();
  // Rows from before emails were collected have an empty address.
  if (!promoted?.email) return;

  await sendConfirmationEmail(env, origin, {
    fullName: promoted.full_name,
    email: promoted.email,
    session,
    result: { status: "confirmed" },
    cancelToken: promoted.cancel_token,
    promoted: true,
  });
}

/** Deletes a booking. A confirmed spot going free moves the first person on the waitlist up. */
export async function releaseSpot(
  env: SignupRuntimeEnv,
  origin: string,
  row: { id: number; experience_id: string },
  waitUntil: WaitUntil,
): Promise<boolean> {
  const before = await resultFor(env.DB, row.experience_id, row.id);
  const { meta } = await env.DB.prepare("DELETE FROM experience_signups WHERE id = ?").bind(row.id).run();
  if (!meta.changes) return false;

  if (before.status === "confirmed") {
    waitUntil(
      notifyPromotion(env, origin, row.experience_id).catch((error) =>
        console.error("experience waitlist promotion email failed", error),
      ),
    );
  }
  return true;
}

/** Inserts a booking at the end of the list, or returns null when that email already holds one. */
export async function insertSignup(
  db: D1Database,
  row: { experienceId: string; fullName: string; email: string; emailKey: string; addedBy?: string },
): Promise<{ id: number; cancelToken: string } | null> {
  const cancelToken = crypto.randomUUID();
  const values = [row.experienceId, row.fullName, row.email, row.emailKey, cancelToken];
  // /links bookings leave out `added_by`, so they keep working on a database without migration 0003.
  const staff = row.addedBy ? ", added_by" : "";
  const inserted = await db
    .prepare(
      `INSERT INTO experience_signups (experience_id, full_name, email, email_key, cancel_token${staff})
       VALUES (?, ?, ?, ?, ?${staff ? ", ?" : ""})
       ON CONFLICT (experience_id, email_key) DO NOTHING
       RETURNING id`,
    )
    .bind(...values, ...(row.addedBy ? [row.addedBy] : []))
    .first<{ id: number }>();
  return inserted ? { id: inserted.id, cancelToken } : null;
}

/** The API honours the page's `?time=` override, so time-travelled previews book for real. */
function requestTime(request: Request): Date {
  return parseTimeTravel(new URL(request.url).searchParams.get("time")) ?? new Date();
}

export async function handleSignup(
  env: SignupRuntimeEnv,
  request: Request,
  waitUntil: WaitUntil,
): Promise<Response> {
  const body = await readJson(request);
  if (!body) return errorResponse("Invalid request.", 400);
  // Honeypot field, hidden from people.
  if (typeof body.company === "string" && body.company.trim()) {
    return errorResponse("Invalid request.", 400);
  }

  const experienceId = typeof body.experienceId === "string" ? body.experienceId : "";
  const session = findSignupSession(experienceId);
  if (!session) return errorResponse("This experience does not take sign-ups.", 404);
  const now = requestTime(request);
  if (now < SIGNUPS_OPEN) return errorResponse(`Sign-ups open on ${SIGNUPS_OPEN_LABEL}.`, 403);
  if (session.start && now >= session.start) {
    return errorResponse("Sign-up for this session has closed.", 409);
  }

  const fullName =
    cleanFullName(body.fullName) ??
    // Back-compat if an older client still posts first/last.
    (() => {
      const first = cleanFullName(body.firstName);
      const last = cleanFullName(body.lastName);
      return first && last ? cleanFullName(`${first} ${last}`) : null;
    })();
  const email = cleanEmail(body.email);
  if (!fullName || !email) {
    return errorResponse("Please enter your full name and a valid email.", 400);
  }

  const key = emailKey(email);
  const inserted = await insertSignup(env.DB, { experienceId, fullName, email, emailKey: key });

  if (!inserted) {
    // Same email already signed up: report their place, but never hand out their cancel token.
    const existing = await env.DB
      .prepare("SELECT id FROM experience_signups WHERE experience_id = ? AND email_key = ?")
      .bind(experienceId, key)
      .first<{ id: number }>();
    if (!existing) return errorResponse("Something went wrong, please try again.", 500);
    return json({ ...(await resultFor(env.DB, experienceId, existing.id)), alreadySignedUp: true });
  }

  const result = await resultFor(env.DB, experienceId, inserted.id);
  const { cancelToken } = inserted;
  waitUntil(sendConfirmationEmail(env, siteOrigin(request), {
    fullName,
    email,
    session,
    result,
    cancelToken,
  }));

  return json({ ...result, cancelToken }, 201);
}

type OwnSignup = { signupId?: number; cancelToken: string };

function parseOwnSignups(value: unknown): OwnSignup[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (s): s is OwnSignup =>
        s &&
        typeof s === "object" &&
        typeof (s as OwnSignup).cancelToken === "string" &&
        ((s as OwnSignup).signupId === undefined || Number.isInteger((s as OwnSignup).signupId)),
    )
    .slice(0, 50);
}

/** Current status of the signups this browser holds tokens for (waitlist promotions included). */
export async function handleOwnStatus(db: D1Database, request: Request): Promise<Response> {
  const body = await readJson(request);
  const signups = parseOwnSignups(body?.signups);
  const results: SignupResult[] = [];

  for (const { signupId, cancelToken } of signups) {
    const row = signupId != null
      ? await db
          .prepare("SELECT experience_id, id FROM experience_signups WHERE id = ? AND cancel_token = ?")
          .bind(signupId, cancelToken)
          .first<{ experience_id: string; id: number }>()
      : await db
          .prepare("SELECT experience_id, id FROM experience_signups WHERE cancel_token = ?")
          .bind(cancelToken)
          .first<{ experience_id: string; id: number }>();
    if (row) results.push(await resultFor(db, row.experience_id, row.id));
  }

  return json({ signups: results });
}

export async function handleCancel(
  env: SignupRuntimeEnv,
  request: Request,
  waitUntil: WaitUntil,
): Promise<Response> {
  const body = await readJson(request);
  if (!body) return errorResponse("Invalid request.", 400);

  const cancelToken = typeof body.cancelToken === "string" ? body.cancelToken.trim() : "";
  const signupId = Number.isInteger(body.signupId) ? (body.signupId as number) : null;
  if (!cancelToken) return errorResponse("Invalid request.", 400);

  const row = await (signupId != null
    ? env.DB
        .prepare("SELECT id, experience_id FROM experience_signups WHERE id = ? AND cancel_token = ?")
        .bind(signupId, cancelToken)
    : env.DB
        .prepare("SELECT id, experience_id FROM experience_signups WHERE cancel_token = ?")
        .bind(cancelToken)
  ).first<{ id: number; experience_id: string }>();
  if (!row) return errorResponse("Sign-up not found.", 404);

  if (!(await releaseSpot(env, siteOrigin(request), row, waitUntil))) {
    return errorResponse("Sign-up not found.", 404);
  }
  return json({ cancelled: true });
}

export type BookingLookup = {
  signupId: number;
  experienceId: string;
  fullName: string;
  email: string;
  cancelToken: string;
  status: SignupStatus;
  waitlistPosition?: number;
  title: string;
  day: string;
  time: string;
  venue?: string;
};

export async function handleBookingLookup(db: D1Database, request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) return errorResponse("Missing cancel token.", 400);

  const row = await db
    .prepare(
      `SELECT id, experience_id, full_name, email, cancel_token
       FROM experience_signups WHERE cancel_token = ?`,
    )
    .bind(token)
    .first<{
      id: number;
      experience_id: string;
      full_name: string;
      email: string;
      cancel_token: string;
    }>();

  if (!row) return errorResponse("Booking not found.", 404);

  const session = findSignupSession(row.experience_id);
  const result = await resultFor(db, row.experience_id, row.id);
  const booking: BookingLookup = {
    signupId: row.id,
    experienceId: row.experience_id,
    fullName: row.full_name,
    email: row.email,
    cancelToken: row.cancel_token,
    status: result.status,
    waitlistPosition: result.waitlistPosition,
    title: session?.title ?? "Experience",
    day: session?.day ?? "",
    time: session?.time ?? "",
    venue: session?.venue,
  };
  return json({ booking });
}

export async function handleIcalDownload(db: D1Database, request: Request): Promise<Response> {
  const token = new URL(request.url).searchParams.get("token")?.trim() ?? "";
  if (!token) return errorResponse("Missing cancel token.", 400);

  const row = await db
    .prepare("SELECT experience_id FROM experience_signups WHERE cancel_token = ?")
    .bind(token)
    .first<{ experience_id: string }>();
  if (!row) return errorResponse("Booking not found.", 404);

  const session = findSignupSession(row.experience_id);
  if (!session?.start || !session.end) return errorResponse("Session not found.", 404);

  const origin = siteOrigin(request);
  const pageUrl = new URL(withBase(`links#${session.id}`), origin).href;
  const ics = buildSessionIcal(session, pageUrl);

  return new Response(ics, {
    status: 200,
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${icalFilename(session)}"`,
      "cache-control": "no-store",
    },
  });
}
