/// <reference types="astro/client" />

interface Env {
  INFOMANIAK_TOKEN: string;
  INFOMANIAK_NEWSLETTER_DOMAIN: string;
  INFOMANIAK_NEWSLETTER_GROUPS?: string;
  NEWSLETTER_DEBUG?: string;
  DB: D1Database;
  EMAIL: SendEmail;
  BOOKING_FROM_EMAIL?: string;
  BOOKING_FROM_NAME?: string;
}
