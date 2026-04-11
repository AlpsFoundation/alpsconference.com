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

## Slack-driven changes (traceability and previews)

When work is started from a Slack request, keep automation and humans aligned without extra databases.

### Commit messages

Every commit that implements a Slack-driven change must end with a line that points back to the originating Slack thread (or message), using one of these forms (copy the permalink from Slack so `thread_ts` is preserved when the UI provides it):

- `Related Slack thread: <full Slack permalink URL>`
- `Fixes issue reported in Slack: <full Slack permalink URL>`

Use the exact permalink from Slack (including `thread_ts` and `cid` query parameters when Slack adds them). This lets CI read the link from `git log` / GitHub’s commit API and post follow-ups in the correct thread.

### Finishing the task

When you consider the coding work complete (build succeeds locally if you ran it, changes are coherent, and you are ready for review):

1. Push your branch to `origin`.
2. Open a pull request on GitHub (do not leave the branch-only unless the user explicitly asked for that). Use a clear title and description summarizing the change.

Automation can then correlate the PR with Slack via the commit message and notify the requester when Cloudflare posts deployment links on the PR.

Repository automation:

- **`scripts/slack-github-notifications.mjs`** — Shared Node entrypoint used by the Slack workflows (`cloudflare-pr-preview` and `main-merge` commands).
- **`.github/workflows/slack-notify-cloudflare-preview.yml`** — On new PR comments from bots that contain Cloudflare’s “Deployment successful” table, parses the preview URLs, reads the Slack permalink from the **PR head** commit message, and posts a short reply in that Slack thread.
- **`.github/workflows/slack-notify-main-merge.yml`** — On every push to `main`, posts a human-readable merge summary to the **`bots`** Slack channel (configurable) with a **Visit** button to the production site.

Configure a GitHub Actions secret **`SLACK_BOT_TOKEN`** (a Slack bot user token with `chat:write` for the workspace). Invite the bot to channels where it should post (`bots` for merge summaries; any channel used in Slack permalinks for preview replies). Optional repository **variables**: `PRODUCTION_SITE_URL` (defaults to `https://alpsconference.com`), `SLACK_BOTS_CHANNEL` (defaults to `bots`; use a channel ID if `#name` resolution fails).
