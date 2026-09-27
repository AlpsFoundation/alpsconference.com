import { EXPERIENCE_SESSIONS, findSignupSession } from "../data/conferenceTimeline";
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

export type SignupRuntimeEnv = {
  DB: D1Database;
  EMAIL?: SendEmail;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_FROM_NAME?: string;
};

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

function cleanFullName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.normalize("NFC").replace(/\s+/g, " ").trim();
  if (!name || name.length > MAX_NAME_LENGTH || !/\p{L}/u.test(name)) return null;
  return name;
}

function cleanEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.normalize("NFC").trim().toLowerCase();
  if (!email || email.length > MAX_EMAIL_LENGTH) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function emailKey(email: string): string {
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

function siteOrigin(request: Request): string {
  const url = new URL(request.url);
  return url.origin;
}

function bookingUrls(request: Request, cancelToken: string) {
  const origin = siteOrigin(request);
  const cancelPath = withBase(`links/cancel?token=${encodeURIComponent(cancelToken)}`);
  const icalPath = withBase(`api/experience-signups/ical?token=${encodeURIComponent(cancelToken)}`);
  return {
    cancelUrl: new URL(cancelPath, origin).href,
    icalUrl: new URL(icalPath, origin).href,
  };
}

async function sendConfirmationEmail(
  env: SignupRuntimeEnv,
  request: Request,
  params: {
    fullName: string;
    email: string;
    session: NonNullable<ReturnType<typeof findSignupSession>>;
    result: SignupResult;
    cancelToken: string;
  },
) {
  if (!env.EMAIL) return;

  const fromEmail = env.BOOKING_FROM_EMAIL?.trim() || "bookings@alpsconference.com";
  const fromName = env.BOOKING_FROM_NAME?.trim() || "ALPS Conference";
  const { cancelUrl, icalUrl } = bookingUrls(request, params.cancelToken);
  const content = buildSignupConfirmationEmail({
    fullName: params.fullName,
    session: params.session,
    status: params.result.status,
    waitlistPosition: params.result.waitlistPosition,
    cancelUrl,
    icalUrl,
  });

  const ics = buildSessionIcal(params.session, icalUrl);

  try {
    await env.EMAIL.send({
      from: { email: fromEmail, name: fromName },
      to: params.email,
      subject: content.subject,
      text: content.text,
      html: content.html,
      attachments: [
        {
          disposition: "attachment",
          filename: icalFilename(params.session),
          type: "text/calendar; charset=utf-8; method=PUBLISH",
          content: ics,
        },
      ],
    });
  } catch (error) {
    // Booking is already saved — don't fail the request if delivery hiccups.
    console.error("experience signup email failed", error);
  }
}

export async function handleSignup(env: SignupRuntimeEnv, request: Request): Promise<Response> {
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
  const cancelToken = crypto.randomUUID();
  const inserted = await env.DB
    .prepare(
      `INSERT INTO experience_signups (experience_id, full_name, email, email_key, cancel_token)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (experience_id, email_key) DO NOTHING
       RETURNING id`,
    )
    .bind(experienceId, fullName, email, key, cancelToken)
    .first<{ id: number }>();

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
  await sendConfirmationEmail(env, request, {
    fullName,
    email,
    session,
    result,
    cancelToken,
  });

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

export async function handleCancel(db: D1Database, request: Request): Promise<Response> {
  const body = await readJson(request);
  if (!body) return errorResponse("Invalid request.", 400);

  const cancelToken = typeof body.cancelToken === "string" ? body.cancelToken.trim() : "";
  const signupId = Number.isInteger(body.signupId) ? (body.signupId as number) : null;
  if (!cancelToken) return errorResponse("Invalid request.", 400);

  const statement = signupId != null
    ? db.prepare("DELETE FROM experience_signups WHERE id = ? AND cancel_token = ?").bind(signupId, cancelToken)
    : db.prepare("DELETE FROM experience_signups WHERE cancel_token = ?").bind(cancelToken);

  const { meta } = await statement.run();
  if (!meta.changes) return errorResponse("Sign-up not found.", 404);
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
