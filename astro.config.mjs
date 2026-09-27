import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

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
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes("/booklet") &&
        !page.includes("/links") &&
        !page.includes("/map") &&
        !page.includes("/3d") &&
        !page.includes("/fancy"),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Pre-bundle three.js up front: otherwise Vite only discovers it when /3d is
    // first opened, re-optimizes, and invalidates the dep chunks of every page
    // already loaded (and of any other dev server sharing node_modules/.vite),
    // breaking React hydration with 404s on the old chunk hashes.
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
