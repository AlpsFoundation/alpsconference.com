import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, rmSync } from "node:fs";

const site = process.env.SITE_URL?.trim() || "https://alpsconference.com";

/** Subfolder deploy: set BASE_PATH=/conference/ (leading/trailing slashes optional). */
function normalizeBase(raw) {
  const s = (raw ?? "").trim();
  if (!s || s === "/") return "/";
  let out = s.startsWith("/") ? s : `/${s}`;
  if (!out.endsWith("/")) out += "/";
  return out;
}

const base = normalizeBase(process.env.BASE_PATH);

/**
 * One Vite cache per `astro dev` process. Several dev servers on this checkout
 * (other terminals, agent previews) otherwise share node_modules/.vite and keep
 * re-optimizing it under each other, so pages already open request dep chunks
 * whose hash no longer exists and hydration fails with "Failed to fetch
 * dynamically imported module". Caches of dev servers that have exited are
 * removed on the next start.
 */
function devCacheDir() {
  if (!process.argv.includes("dev")) return undefined;
  const root = "node_modules/.vite";
  let entries = [];
  try {
    entries = readdirSync(root);
  } catch {}
  for (const name of entries) {
    const pid = Number(name.match(/^dev-(\d+)$/)?.[1]);
    if (!pid || pid === process.pid) continue;
    try {
      process.kill(pid, 0);
    } catch (err) {
      if (err.code !== "ESRCH") continue;
      rmSync(`${root}/${name}`, { recursive: true, force: true });
    }
  }
  return `${root}/dev-${process.pid}`;
}

export default defineConfig({
  output: "static",
  adapter: cloudflare({
    imageService: "passthrough",
    prerenderEnvironment: "node",
    sessionKVBindingName: false,
  }),
  session: {
    driver: {
      entrypoint: "unstorage/drivers/null",
    },
  },
  site,
  base,
  redirects: {
    // The 3D landing page used to live here before it became the home page.
    "/fancy": "/",
    // Short alias for the venue map.
    "/plan": "/map",
    // Renamed to /slides.
    "/break": "/slides",
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/booklet") &&
        !page.includes("/links") &&
        !page.includes("/map") &&
        !page.includes("/3d") &&
        !page.includes("/static") &&
        !page.includes("/bingo") &&
        !page.includes("/slides") &&
        !page.includes("/banners") &&
        !page.includes("/countdown") &&
        !page.includes("/volunteers"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    cacheDir: devCacheDir(),
    // Pre-bundle three.js up front: otherwise Vite only discovers it when /3d is
    // first opened, re-optimizes, and invalidates the dep chunks of every page
    // already loaded, breaking React hydration with 404s on the old chunk hashes.
    optimizeDeps: {
      include: [
        "three",
        "three/addons/lines/LineSegments2.js",
        "three/addons/lines/LineSegmentsGeometry.js",
        "three/addons/lines/LineMaterial.js",
      ],
    },
  },
});
