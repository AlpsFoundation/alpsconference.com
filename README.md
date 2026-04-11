![ALPS Research Conference 2026](public/img/opengraph.jpg)

# ALPS Research Conference

Astro 6 landing page for the ALPS Research Conference 2026, now prepared for deployment on **Cloudflare Workers**.

The site remains prerendered/static for the public landing page, while the newsletter signup runs as a single on-demand Cloudflare-backed API route at `/api/newsletter-subscribe`.

## Local development

### Install dependencies

```bash
pnpm install
```

### Generate Cloudflare runtime types

Run this once after install, and again any time `wrangler.jsonc` changes.

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
pnpm run generate-types # regenerate worker-configuration.d.ts from wrangler.jsonc
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

\* Required when you want to test the newsletter signup route. The static landing page itself does not require them.

### Runtime secrets in Cloudflare

Set the same newsletter secrets in Cloudflare for production/preview deployments, for example with Wrangler:

```bash
wrangler secret put INFOMANIAK_TOKEN
wrangler secret put INFOMANIAK_NEWSLETTER_DOMAIN
wrangler secret put INFOMANIAK_NEWSLETTER_GROUPS
wrangler secret put NEWSLETTER_DEBUG
```

## Deployment

This repository is configured for **Cloudflare Workers**, not Pages.

- Static assets are served from the Astro build output.
- The newsletter signup endpoint is handled by the generated Worker.
- `@astrojs/sitemap` generates `sitemap-index.xml` and `sitemap-0.xml` during the build.

### GitHub Actions

Two workflows are expected:

- **Production deployment** on pushes to `main`
- **Preview deployment** on pull requests only

Add these GitHub repository secrets:

| Secret | Required | Description |
| --- | --- | --- |
| `CLOUDFLARE_API_TOKEN` | Yes | API token with permission to deploy the Worker. |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | Cloudflare account ID for the target Worker. |

## Output structure

After `pnpm build`, the Cloudflare-ready artifacts are generated in `dist/`:

- `dist/client/` — prerendered static assets
- `dist/server/` — Worker entry and generated Wrangler deployment config
- `dist/client/sitemap-index.xml` and `dist/client/sitemap-0.xml` — generated sitemap files
