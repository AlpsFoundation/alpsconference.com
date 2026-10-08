import { LogLevel, WorkerMailer } from "worker-mailer";

export type MailerEnv = {
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  /** App password of the SMTP_USER Google account. */
  GOOGLE_APPS_PASSWORD?: string;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_FROM_NAME?: string;
};

export type BookingEmail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; mimeType: string; content: string }[];
};

function base64(value: string): string {
  let binary = "";
  for (const byte of new TextEncoder().encode(value)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/**
 * Sends a booking email through Gmail SMTP (smtp.gmail.com:465) as SMTP_USER,
 * notifications@alps.foundation, signing in with its Google app password.
 * Without the password, e.g. in local dev, the email is skipped and logged.
 */
export async function sendBookingEmail(env: MailerEnv, email: BookingEmail): Promise<void> {
  const username = env.SMTP_USER?.trim();
  // Google shows app passwords in groups of four; the spaces are not part of them.
  const password = env.GOOGLE_APPS_PASSWORD?.replace(/\s+/g, "");
  if (!username || !password) {
    console.warn(`booking email to ${email.to} skipped: SMTP_USER / GOOGLE_APPS_PASSWORD are not set`);
    return;
  }

  const port = Number(env.SMTP_PORT) || 465;
  const mailer = await WorkerMailer.connect({
    host: env.SMTP_HOST?.trim() || "smtp.gmail.com",
    port,
    // Implicit TLS on 465, STARTTLS on 587.
    secure: port === 465,
    credentials: { username, password },
    authType: ["plain", "login"],
    // DEBUG would log the AUTH exchange.
    logLevel: LogLevel.WARN,
  });

  try {
    await mailer.send({
      // Gmail only sends as the account itself or one of its verified aliases.
      from: {
        email: env.BOOKING_FROM_EMAIL?.trim() || username,
        name: env.BOOKING_FROM_NAME?.trim() || "ALPS Conference",
      },
      to: email.to,
      subject: email.subject,
      text: email.text,
      html: email.html,
      attachments: email.attachments?.map((a) => ({ ...a, content: base64(a.content) })),
    });
  } finally {
    await mailer.close().catch(() => {});
  }
}
