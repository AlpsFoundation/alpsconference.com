#!/usr/bin/env node
/**
 * Renders the Open Graph cards in cards.mjs to public/og/<slug>.jpg, through
 * template.html in headless Chrome.
 *
 *   pnpm og                  every card
 *   pnpm og bingo map        only these slugs
 *   pnpm og --preview        serve the template to edit it in a browser
 *
 * Uses the installed Google Chrome. Set CHROME_PATH to use another Chromium build.
 */
import { createServer } from "node:http";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { CARDS, WITHOUT_CARD } from "./cards.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = join(ROOT, "public/og");
const WIDTH = 1200;
const HEIGHT = 630;
const JPEG_QUALITY = 88;

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};

/** Serves the template and the site's public assets; the font needs http, not file://. */
function serve() {
  const allowed = [join(ROOT, "public"), join(ROOT, "scripts/og")];
  const server = createServer(async (req, res) => {
    const path = resolve(ROOT, "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname));
    if (!allowed.some((dir) => path.startsWith(dir + sep))) {
      res.writeHead(404).end();
      return;
    }
    try {
      const body = await readFile(path);
      res.writeHead(200, { "content-type": TYPES[extname(path)] ?? "application/octet-stream" }).end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((done) => server.listen(0, "127.0.0.1", () => done(server)));
}

/** Pages under src/pages whose og:image is not one of the cards, bar WITHOUT_CARD. */
async function pagesWithoutCard() {
  const pagesDir = join(ROOT, "src/pages");
  const files = (await readdir(pagesDir, { recursive: true })).filter(
    (f) => f.endsWith(".astro") && !WITHOUT_CARD.includes(f.split(sep).join("/"))
  );
  const slugs = new Set(CARDS.map((c) => c.slug));
  const missing = [];
  for (const file of files) {
    const source = await readFile(join(pagesDir, file), "utf8");
    const slug = source.match(/og\/([\w-]+)\.jpg/)?.[1];
    if (!slug || !slugs.has(slug)) missing.push(relative(ROOT, join(pagesDir, file)));
  }
  return missing;
}

const args = process.argv.slice(2);
const server = await serve();
const origin = `http://127.0.0.1:${server.address().port}`;
const templateUrl = (slug) => `${origin}/scripts/og/template.html?slug=${encodeURIComponent(slug)}`;

if (args.includes("--preview")) {
  console.log("Serving the template. Open a card, edit template.html or cards.mjs, reload:\n");
  for (const card of CARDS) console.log(`  ${card.slug.padEnd(16)} ${templateUrl(card.slug)}`);
  console.log("\nCtrl+C to stop.");
} else {
  const unknown = args.filter((slug) => !CARDS.some((c) => c.slug === slug));
  if (unknown.length) {
    console.error(`No card named ${unknown.join(", ")}. Cards: ${CARDS.map((c) => c.slug).join(", ")}`);
    process.exit(1);
  }
  const cards = args.length ? CARDS.filter((c) => args.includes(c.slug)) : CARDS;

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
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 1 });
  for (const card of cards) {
    await page.goto(templateUrl(card.slug));
    await page.waitForFunction(() => window.cardReady === true);
    const image = await page.locator(".card").screenshot({ type: "jpeg", quality: JPEG_QUALITY });
    const file = join(OUT_DIR, `${card.slug}.jpg`);
    await writeFile(file, image);
    console.log(`${relative(ROOT, file)}  ${(image.length / 1024).toFixed(0)} KB  ${card.title}`);
    for (const warning of await page.evaluate(() => window.cardWarnings)) console.warn(`  ! ${warning}`);
  }
  await browser.close();
  server.close();

  const missing = await pagesWithoutCard();
  if (missing.length) {
    console.warn(`\nThese pages do not point og:image at a card yet:\n${missing.map((f) => `  ${f}`).join("\n")}`);
  }
}
