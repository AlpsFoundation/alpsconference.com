![ALPS Research Conference 2026](public/img/opengraph.jpg)

# ALPS Research Conference

Astro 6 landing page for the ALPS Research Conference 2026, now prepared for deployment on **Cloudflare Workers**.

The site remains prerendered/static for the public landing page, while the newsletter signup runs as a single on-demand Cloudflare-backed API route at `/api/newsletter-subscribe`.

## Local development

### Install dependencies

```bash
pnpm install
```

`pnpm install` also regenerates the local Cloudflare Worker type file automatically.

### Generate Cloudflare runtime types

This is run automatically on install. Re-run it manually any time `wrangler.jsonc` changes and you want to refresh local types immediately.

```bash
pnpm run generate-types
```

### Configure local newsletter secrets

Copy the example file and fill in your Infomaniak credentials:

```bash
cp .dev.vars.example .dev.vars
```

These variables are read by the Cloudflare Workers runtime during `astro dev` and `astro preview`.

### Start the development server

```bash
pnpm dev
```

Astro now runs with the Cloudflare Workers runtime locally, so the newsletter form can submit directly to the local `/api/newsletter-subscribe` endpoint without a separate PHP server.

### Preview the production build locally

```bash
pnpm build
pnpm preview
```

## Scripts

```bash
pnpm dev                # local development with Cloudflare runtime
pnpm build              # production build
pnpm preview            # preview the built Worker locally
pnpm run generate-types # regenerate local worker-configuration.d.ts from wrangler.jsonc
pnpm run deploy         # deploy to Cloudflare Workers
pnpm run deploy:preview # upload a non-production Worker version
```

## Environment variables

### Build-time variables

Copy `.env.example` to `.env` if you want local build-time overrides:

```bash
cp .env.example .env
```

| Variable | Required | Description |
| --- | --- | --- |
| `SITE_URL` | No | Canonical deployed site URL used for metadata and sitemap generation. Defaults to `https://alpsconference.com`. |
| `BASE_PATH` | No | Optional subfolder base path (for example `/conference/`). Leading/trailing slashes are normalized automatically. |

### Runtime secrets for local development

Configure these in `.dev.vars`:

| Variable | Required | Description |
| --- | --- | --- |
| `INFOMANIAK_TOKEN` | Yes* | Infomaniak API token with newsletter access. |
| `INFOMANIAK_NEWSLETTER_DOMAIN` | Yes* | Infomaniak newsletter domain ID. Must be a positive integer. |
| `INFOMANIAK_NEWSLETTER_GROUPS` | No | Optional comma-separated group IDs and/or group names to assign new subscribers to. |
| `NEWSLETTER_DEBUG` | No | Set to `1` to include extra `debug` details in API error responses during local troubleshooting. |
| `SMTP_USER` | Yes** | Address of the booking mailbox (a Gmail account). |
| `SMTP_PASS` | Yes** | A Google app password for that account (Google Account → Security → 2-Step Verification → App passwords). Spaces are ignored. |
| `SMTP_HOST` | No | Defaults to `smtp.gmail.com`. |
| `SMTP_PORT` | No | Defaults to `465` (implicit TLS); `587` uses STARTTLS. |
| `BOOKING_FROM_EMAIL` | No | From-address for booking emails. Defaults to `SMTP_USER`; Gmail only sends as the account itself or one of its verified "Send mail as" aliases. |
| `BOOKING_FROM_NAME` | No | Display name for booking emails. Defaults via `wrangler.jsonc` to `ALPS Conference`. |

\* Required when you want to test the newsletter signup route. The static landing page itself does not require them.

\*\* Without them, bookings still work and the emails are skipped (logged as a warning).

### Experience bookings

`/links` takes experience sign-ups into the `alpsconference-signups` D1 database (`pnpm db:migrate:local` once before `pnpm dev`). Each booking sends a confirmation with a calendar file and a cancel link; when a confirmed spot is cancelled, the first person on the waitlist moves up and gets a "spot opened up" email. The emails go out over SMTP from the booking Gmail mailbox (`src/lib/bookingMailer.ts`, [worker-mailer](https://github.com/zou-yu/worker-mailer) over Cloudflare TCP sockets).

Staff manage bookings at [tools.alps.foundation/experiences](https://tools.alps.foundation/experiences/) (Google sign-in, `AlpsFoundation/tools.alps.foundation`, package `experiences`): per session, who is confirmed and waiting, add someone at the desk, remove a booking, and door check-in. That tool reaches the bookings through the `ExperienceBookings` RPC entrypoint in `src/worker.ts` (logic in `src/lib/experienceAdmin.ts`), which only a service binding can call — it has no public URL. Apply migration `0003_experience_signups_staff.sql` (`pnpm db:migrate:remote`) before that tool goes live; bookings from `/links` work with or without it.

Sign-ups open on **8 October 2026 at 00:00 in Aarau** (`SIGNUPS_OPEN` in `src/data/conferenceTimeline.ts`); until then the page shows the opening date and the API refuses bookings. `?time=yyyy-mm-dd-hh-mm` on `/links` moves the page's clock, and the API follows it, so `/links?time=2026-10-08-10-00` books for real before opening — cancel those test bookings from their email before 8 October.

### Runtime secrets in Cloudflare

Set the same newsletter secrets in Cloudflare for production/preview deployments, for example with Wrangler:

```bash
wrangler secret put INFOMANIAK_TOKEN
wrangler secret put INFOMANIAK_NEWSLETTER_DOMAIN
wrangler secret put INFOMANIAK_NEWSLETTER_GROUPS
wrangler secret put NEWSLETTER_DEBUG
wrangler secret put SMTP_USER
wrangler secret put SMTP_PASS
```

## Calendar feeds

Two subscribable iCalendar feeds are prerendered at build time from the same data the
schedule renders, so publishing a program change republishes the feeds:

| Feed | URL | Source |
| --- | --- | --- |
| Main track | `https://alpsconference.com/alps-2026-talks.ics` | `src/data/program.ts` |
| Experiences | `https://alpsconference.com/alps-2026-experiences.ics` | `src/data/experiences.ts` |

`src/lib/ical.ts` builds them; `src/components/CalendarSubscribe.tsx` renders the
"Add to calendar" button above each schedule (Google Calendar, `webcal://` subscription,
or a one-off `.ics` download). People who subscribe rather than download receive later
changes on their calendar client's own refresh schedule — typically a few hours, up to
about a day for Google Calendar.

## Deployment

This repository is configured for **Cloudflare Workers**, not Pages.

- Static assets are served from the Astro build output.
- The newsletter signup endpoint is handled by the generated Worker.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` during the build.

### Manual deployment

For a manual deployment from your local machine or CI environment, provide:

| Value | Required | Description |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Yes | API token with permission to deploy the Worker. |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID for the target Worker. |

Then run:

```bash
pnpm run deploy
```

## Output structure

After `pnpm build`, the Cloudflare-ready artifacts are generated in `dist/`:

- `dist/client/` — prerendered static assets
- `dist/server/` — Worker entry and generated Wrangler deployment config
- `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml` — generated sitemap files
- `dist/client/alps-2026-talks.ics` and `dist/client/alps-2026-experiences.ics` — calendar feeds
