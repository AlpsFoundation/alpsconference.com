/// <reference types="astro/client" />

interface Env {
  INFOMANIAK_TOKEN: string;
  INFOMANIAK_NEWSLETTER_DOMAIN: string;
  INFOMANIAK_NEWSLETTER_GROUPS?: string;
  NEWSLETTER_DEBUG?: string;
  DB: D1Database;
  /** Booking mailbox login, e.g. the Gmail address and an app password. */
  SMTP_USER?: string;
  SMTP_PASS?: string;
  /** Defaults to smtp.gmail.com and 465. */
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  /** Defaults to SMTP_USER; Gmail only sends as the account or a verified alias. */
  BOOKING_FROM_EMAIL?: string;
  BOOKING_FROM_NAME?: string;
}
