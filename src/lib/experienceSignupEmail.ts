import type { ExperienceSession } from "../data/conferenceTimeline";
import type { SignupStatus } from "./experienceSignups";

export type SignupEmailContent = {
  subject: string;
  text: string;
  html: string;
};

type BuildSignupEmailParams = {
  fullName: string;
  session: ExperienceSession;
  status: SignupStatus;
  waitlistPosition?: number;
  /** Moved up from the waitlist after someone cancelled. */
  promoted?: boolean;
  /** Sent again because the same email signed up once more. */
  resent?: boolean;
  cancelUrl: string;
  icalUrl: string;
};

const BRAND = "#0B3C5D";
const ACCENT = "#2E7CC7";

export function buildSignupConfirmationEmail({
  fullName,
  session,
  status,
  waitlistPosition,
  promoted = false,
  resent = false,
  cancelUrl,
  icalUrl,
}: BuildSignupEmailParams): SignupEmailContent {
  const confirmed = status === "confirmed";
  const subject = promoted
    ? `A spot opened up — ${session.title} · ALPS 2026`
    : confirmed
      ? `You're in — ${session.title} · ALPS 2026`
      : `Waitlist — ${session.title} · ALPS 2026`;

  const statusLine = (resent ? "You signed up again, so here are your booking links once more. " : "") + (promoted
    ? "A spot opened up, so you're off the waitlist and your place is confirmed."
    : confirmed
      ? "Your spot is confirmed."
      : `You're on the waitlist${waitlistPosition ? ` at position ${waitlistPosition}` : ""}. We'll email you if a place opens.`);

  const when = `${session.day} · ${session.time}`;
  const where = session.venue
    ? `${session.venue} · Kultur & Kongresshaus Aarau`
    : "Kultur & Kongresshaus Aarau";

  const text = [
    `Hi ${fullName},`,
    "",
    statusLine,
    "",
    session.title,
    when,
    where,
    "",
    `Add to your calendar: ${icalUrl}`,
    "",
    `Need to cancel? ${cancelUrl}`,
    "",
    "See you in Aarau,",
    "ALPS Conference 2026",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" />
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Georgia,'Times New Roman',serif;color:#1a2a36;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:28px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;">
        <tr><td style="background:${BRAND};padding:22px 28px;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:rgba(255,255,255,0.7);">ALPS Conference 2026</p>
          <h1 style="margin:8px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:22px;font-weight:650;color:#ffffff;line-height:1.25;">${escapeHtml(confirmed ? "You're signed up" : "You're on the waitlist")}</h1>
        </td></tr>
        <tr><td style="padding:28px;">
          <p style="margin:0 0 16px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#243746;">Hi ${escapeHtml(fullName)},</p>
          <p style="margin:0 0 22px;font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#243746;">${escapeHtml(statusLine)}</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f6fb;border-radius:10px;margin:0 0 22px;">
            <tr><td style="padding:16px 18px;">
              <p style="margin:0 0 6px;font-family:Helvetica,Arial,sans-serif;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${ACCENT};font-weight:700;">Experience</p>
              <p style="margin:0 0 10px;font-family:Helvetica,Arial,sans-serif;font-size:17px;font-weight:650;color:${BRAND};">${escapeHtml(session.title)}</p>
              <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#3d5160;">${escapeHtml(when)}<br />${escapeHtml(where)}</p>
            </td></tr>
          </table>
          <p style="margin:0 0 10px;">
            <a href="${escapeAttr(icalUrl)}" style="display:inline-block;padding:11px 18px;background:${BRAND};color:#ffffff;text-decoration:none;border-radius:999px;font-family:Helvetica,Arial,sans-serif;font-size:14px;font-weight:650;">Add to calendar</a>
          </p>
          <p style="margin:18px 0 0;font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.5;color:#6b7c88;">
            Changed plans? <a href="${escapeAttr(cancelUrl)}" style="color:${ACCENT};">Cancel this booking</a>.
          </p>
        </td></tr>
        <tr><td style="padding:16px 28px 22px;border-top:1px solid #e8eef3;">
          <p style="margin:0;font-family:Helvetica,Arial,sans-serif;font-size:12px;color:#8a9aaa;line-height:1.45;">9–10 October 2026 · Kultur &amp; Kongresshaus Aarau<br />alpsconference.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(value: string) {
  return escapeHtml(value).replace(/'/g, "&#39;");
}
