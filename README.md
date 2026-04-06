# ALPS Research Conference

![Open Graph social preview](public/img/opengraph.jpg)

Standalone Astro project for the ALPS Research Conference landing page. The same asset is served at `/img/opengraph.jpg`.

## Commands

```bash
bun install
bun run dev
bun run build
bun run preview
```

The production-ready static site is generated in `dist/`.

## Environment variables

Copy `.env.example` to `.env` for local development. Values are read by Vite/Astro (prefixed `PUBLIC_*`), by `astro.config.mjs` at build time, and by `api/newsletter-subscribe.php` when the newsletter endpoint is deployed.

| Variable | Required | Description |
| --- | --- | --- |
| `SITE_URL` | No | Absolute origin for the site (e.g. `https://alpsconference.com`). Passed to Astro’s `site` option so metadata (including `og:image`) can be absolute URLs. Typically set in the shell for CI: `SITE_URL=https://… bun run build`. |
| `BASE_PATH` | No | Subfolder base path for static hosting (e.g. `/conference/`). Leading/trailing slashes optional; Astro normalizes to a trailing slash. Default `/`. |
| `PUBLIC_NEWSLETTER_API_URL` | No | URL the browser uses to POST newsletter signups. Empty disables the client-side call. |
| `INFOMANIAK_TOKEN` | Yes† | Infomaniak API token (Manager → API / OAuth; newsletter scope). Used only by the PHP newsletter handler. |
| `INFOMANIAK_NEWSLETTER_DOMAIN` | Yes† | Newsletter domain ID (positive integer from Infomaniak Manager → Newsletter). |
| `INFOMANIAK_NEWSLETTER_GROUPS` | No | Optional comma-separated group IDs and/or group names (Infomaniak API `groups` body parameter). |
| `ALLOWED_ORIGINS` | Yes† | Comma-separated browser `Origin` values allowed for CORS on the newsletter API (exact scheme, host, and port). |
| `NEWSLETTER_DEBUG` | No | Set to `1` to enable extra logging and JSON `debug` fields on errors from the PHP handler. |

† Required only when deploying and using `api/newsletter-subscribe.php`. Not needed for a purely static preview of the landing page.
