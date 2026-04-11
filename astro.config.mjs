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
  output: "hybrid",
  adapter: cloudflare(),
  site,
  base,
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
