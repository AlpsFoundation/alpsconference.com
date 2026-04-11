# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static landing page for the ALPS Research Conference (9-10 October 2026, Aarau, Switzerland), built with Astro 6. Single-page site with particle animations and interactive motion tracking.

## Commands

Uses pnpm as package manager:

```bash
pnpm install         # Install dependencies
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
