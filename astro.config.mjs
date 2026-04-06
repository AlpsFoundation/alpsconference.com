import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.SITE_URL;
const root = fileURLToPath(new URL(".", import.meta.url));

/** Subfolder deploy: set BASE_PATH=/conference/ (leading/trailing slashes optional). */
function normalizeBase(raw) {
  const s = (raw ?? "").trim();
  if (!s || s === "/") return "/";
  let out = s.startsWith("/") ? s : `/${s}`;
  if (!out.endsWith("/")) out += "/";
  return out;
}

const base = normalizeBase(process.env.BASE_PATH);

/** Where Astro writes pages relative to `dist/` (mirrors `base`). */
function deploySubdirFromBase(basePath) {
  return basePath.replace(/^\/+|\/+$/g, "");
}

function copyNewsletterDeployAssets() {
  return {
    name: "copy-newsletter-deploy-assets",
    closeBundle() {
      const outDir = resolve(root, "dist");
      const sub = deploySubdirFromBase(base);
      const targetRoot = sub ? join(outDir, sub) : outDir;
      const apiDir = join(targetRoot, "api");
      mkdirSync(apiDir, { recursive: true });

      const phpSrc = join(root, "api", "newsletter-subscribe.php");
      const phpDest = join(apiDir, "newsletter-subscribe.php");
      if (existsSync(phpSrc)) {
        copyFileSync(phpSrc, phpDest);
      }

      const envSrc = join(root, ".env");
      const envDest = join(targetRoot, ".env");
      if (existsSync(envSrc)) {
        copyFileSync(envSrc, envDest);
      }

      const htaccessSrc = join(root, "public", ".htaccess");
      const htaccessDest = join(targetRoot, ".htaccess");
      if (existsSync(htaccessSrc)) {
        copyFileSync(htaccessSrc, htaccessDest);
      }
    },
  };
}

export default defineConfig({
  output: "static",
  site,
  base,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss(), copyNewsletterDeployAssets()],
  },
});
