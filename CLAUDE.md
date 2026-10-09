# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for the ALPS Research Conference (9-10 October 2026, Aarau, Switzerland), built with Astro 6. Single-page site with particle animations and interactive motion tracking.

## Commands

Uses pnpm as package manager:

```bash
pnpm install         # Install dependencies (also regenerates worker-configuration.d.ts)
pnpm dev             # Development server with hot reload
pnpm build           # Production build to dist/
pnpm preview         # Preview production build locally
pnpm og              # Regenerate the Open Graph cards in public/og/ (needs Google Chrome)
pnpm app-icon        # Regenerate the /links home screen icons in public/app-icon/ (needs Google Chrome)
pnpm db:migrate:local # Create the local experience sign-ups database (DB)
pnpm db:crew:local   # Create the local build crew tables for /volunteers (CREW_DB)
```

For production builds with absolute metadata URLs:
```bash
SITE_URL=https://alpsconference.com pnpm build
```

No lint, test, or formatting scripts are configured.

## Architecture

This is a minimal Astro static site (`output: "static"`) with a single page:

- **`src/layouts/BaseLayout.astro`** — HTML document shell. Accepts `title`, `description`, `ogTitle`, `ogDescription`, `ogImage` props. Handles font preloading, meta tags, and deferred script loading.
- **`src/pages/index.astro`** — The only page. CSS grid layout with semantic sections (logo, event details, speakers, partners, etc.).
- **`src/styles/global.css`** — All styling (~500 lines). Uses CSS custom properties for dynamic pointer/orientation tracking, dark theme with `#123e67` base, responsive breakpoints at 640px and 768px.
- **`public/scripts.js`** — Vanilla JS particle system (42+ particles in ambient, center-cluster, and bridge groups). Tracks mouse/pointer position and device orientation to drive CSS custom properties for 3D transforms. Respects `prefers-reduced-motion`.
- **`public/`** — Static assets copied as-is: fonts (Switzer variable font), images, scripts.
- **`reference/`** — Historical 2024/2025 versions for design reference; not part of the build.

The site has no server-side logic, no external JS dependencies, and no build-time data fetching.

## Open Graph images

Every page's `og:image` points at its own 1200 × 630 card in `public/og/<slug>.jpg`. The cards are committed, not rendered by the build. They come from one template:

- **`scripts/og/cards.mjs`** — one entry per page: `slug` (file name), `path` (URL printed on the card), `title` (Title Case), `subtitle` (a sentence), and optional `date` / `place` / `placeIcon` for the footer (defaults: the conference dates and venue). `WITHOUT_CARD` lists the pages that deliberately have none (`/3d`, `/links/cancel`).
- **`scripts/og/template.html`** — the card design (site gradient, synapse illustration, logo, Switzer, Lucide icons). A title that wraps steps down a size; the script warns when a title or subtitle needs more than two lines.
- **`scripts/og/generate.mjs`** — screenshots each card in headless Chrome through `playwright-core`. Uses the installed Google Chrome; set `CHROME_PATH` for another Chromium build.

```bash
pnpm og              # Regenerate every card
pnpm og bingo map    # Regenerate only these slugs
pnpm og --preview    # Serve the template to edit it in a browser (?slug=<slug>)
```

To add a page, append an entry to `cards.mjs`, point the page's `og:image` at `og/<slug>.jpg` (keep the `og:image:width`/`height` tags), and run `pnpm og <slug>`. The script lists any page whose `og:image` is not a card and that is not in `WITHOUT_CARD`.

## Home screen icon (/links)

Adding `/links` to a phone's home screen installs it as "ALPS 2026" (full name "ALPS Conference 2026"), opening standalone at `/links/` with the whole site in scope. `public/links.webmanifest` holds the name, colours and icons; `src/pages/links.astro` links it and sets the iOS `apple-touch-icon` and `apple-mobile-web-app-title`. The icons in `public/app-icon/` are committed, rendered from `scripts/app-icon/template.html` (navy field, hero aura, white ALPS mark from `scripts/app-icon/alps-mark.svg`) by `pnpm app-icon`; set `CHROME_PATH` for another Chromium build.

## Slack-driven changes (traceability and previews)

When work is started from a Slack request, keep automation and humans aligned without extra databases.

### Commit messages

Every commit that implements a Slack-driven change must end with a line that points back to the originating Slack thread (or message), using one of these forms (copy the permalink from Slack so `thread_ts` is preserved when the UI provides it):

- `Related Slack thread: <full Slack permalink URL>`
- `Fixes issue reported in Slack: <full Slack permalink URL>`

Use the exact permalink from Slack (including `thread_ts` and `cid` query parameters when Slack adds them). This lets CI read the link from `git log` / GitHub’s commit API and post follow-ups in the correct thread.

### Finishing the task

When you consider the coding work complete (build succeeds locally if you ran it, changes are coherent, and you are ready for review):

1. **Check for an existing PR first.** Before creating a new PR, search GitHub for open pull requests whose head commit message contains the Slack permalink for this thread. If one exists, push your new commits to that branch and reply in Slack with a **"View PR"** button linking to the existing PR — do not open a second PR.
2. If no PR exists for this thread, push your branch to `origin` and open a new pull request. Use a clear title and description summarizing the change.

Do not leave a branch-only state unless the user explicitly asked for that.

Automation can then correlate the PR with Slack via the commit message and notify the requester when Cloudflare posts deployment links on the PR.

Repository automation:

- **`scripts/slack-github-notifications.mjs`** — Shared Node entrypoint used by the Slack workflows (`cloudflare-pr-preview` and `main-merge` commands).
- **`.github/workflows/slack-notify-cloudflare-preview.yml`** — On new PR comments from bots that contain Cloudflare’s “Deployment successful” table, parses the preview URLs, reads the Slack permalink from the **PR head** commit message, and posts a short reply in that Slack thread.
- **`.github/workflows/slack-notify-main-merge.yml`** — When the **Cloudflare Workers & Pages** GitHub App finishes a **successful** check run for **`main`**, posts a short summary to the **`bots`** Slack channel with a primary **Visit** button. This follows Cloudflare’s deploy result, not the moment of `git push`, so a failed Cloudflare production build does not send the Slack message. Optional variable **`CLOUDFLARE_CHECK_NAME_SUBSTR`**: substring that must appear in the check run name (defaults to `Workers Builds` in the script — set this if your production check label differs, e.g. Pages-only projects).

Configure a GitHub Actions secret **`SLACK_BOT_TOKEN`** (a Slack bot user token with `chat:write` for the workspace). Invite the bot to channels where it should post (`bots` for merge summaries; any channel used in Slack permalinks for preview replies). Optional repository **variables**: `PRODUCTION_SITE_URL` (defaults to `https://alpsconference.com`), `SLACK_BOTS_CHANNEL` (defaults to `#bots`; use a channel ID if name resolution fails).

Workflows use **`actions/checkout@v6`** so composite actions run on the supported Node runtime (avoids the Node 20 deprecation warning from older checkout releases).

## Response metadata

At the end of every response, print a one-line metadata footer:

```
Model: <model-id> | Input: <input tokens> | Output: <output tokens> | Cost: ~$<cost USD>
```

Use the model ID from the environment (e.g. `claude-sonnet-4-6`). Estimate token counts from the response length if exact figures are unavailable. Use Anthropic's published per-token pricing to compute the cost estimate.
