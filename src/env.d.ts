/// <reference types="astro/client" />

interface Env {
  INFOMANIAK_TOKEN: string;
  INFOMANIAK_NEWSLETTER_DOMAIN: string;
  INFOMANIAK_NEWSLETTER_GROUPS?: string;
  NEWSLETTER_DEBUG?: string;
  DB: D1Database;
  /** Gmail account the booking emails are sent as (notifications@alps.foundation), and its app password. */
  SMTP_USER?: string;
  GOOGLE_APPS_PASSWORD?: string;
  /** Defaults to smtp.gmail.com and 465. */
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  /** Defaults to SMTP_USER; Gmail only sends as the account or a verified alias. */
  BOOKING_FROM_EMAIL?: string;
  BOOKING_FROM_NAME?: string;
}
