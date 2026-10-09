#!/usr/bin/env node
/**
 * Renders the /links home screen icons to public/app-icon/, through
 * template.html in headless Chrome. The manifest (public/links.webmanifest)
 * and the apple-touch-icon link in src/pages/links.astro point at them.
 *
 *   pnpm app-icon
 *
 * Uses the installed Google Chrome. Set CHROME_PATH to use another Chromium build.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT_DIR = join(ROOT, "public/app-icon");

const ICONS = [
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
  { file: "icon-maskable-512.png", size: 512, variant: "maskable" },
  // iOS rounds the corners itself and wants no transparency.
  { file: "apple-touch-icon.png", size: 180 },
];

let browser;
try {
  browser = await chromium.launch(
    process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }
  );
} catch (error) {
  console.error("Could not start Chrome. Install Google Chrome, or set CHROME_PATH to a Chromium binary.\n");
  throw error;
}

await mkdir(OUT_DIR, { recursive: true });
for (const icon of ICONS) {
  const page = await browser.newPage({ viewport: { width: icon.size, height: icon.size }, deviceScaleFactor: 1 });
  const url = pathToFileURL(join(HERE, "template.html"));
  if (icon.variant) url.searchParams.set("variant", icon.variant);
  await page.goto(url.href);
  await page.locator(".mark").evaluate((img) => img.decode());
  const image = await page.locator(".icon").screenshot({ type: "png" });
  const file = join(OUT_DIR, icon.file);
  await writeFile(file, image);
  console.log(`${relative(ROOT, file)}  ${icon.size}×${icon.size}  ${(image.length / 1024).toFixed(0)} KB`);
  await page.close();
}
await browser.close();
