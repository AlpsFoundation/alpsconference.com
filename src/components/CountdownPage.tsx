import { useEffect, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { downloadCanvas, drawCover, loadImage, type ImageType } from "../lib/canvasImage";
import { withBase } from "../lib/withBase";
import { PROGRAM } from "../data/program";
import {
  FRIDAY_PANEL_SPEAKER_NAMES,
  SATURDAY_PANEL_SPEAKER_NAMES,
  getImageCrop,
  speakerByName,
  type Speaker,
} from "../data/speakers";
import { WORKSHOP_DAY, WORKSHOP_TRACKS } from "../data/workshops";

// One carousel per day of the last week before the conference, for Instagram
// and LinkedIn. Every slide is drawn on a canvas at 2× the 1080 × 1350 feed
// size, so the preview is exactly the file that is downloaded. Photos come
// from the Media Library (73_Photos, ALPS Conf 2024 at the same venue and
// ALPS Conf 2025), pre-cropped to 4:5 in public/img/countdown/.

const W = 1080;
const H = 1350;
const SCALE = 2;
const MARGIN = 72;
const CONTENT_WIDTH = W - MARGIN * 2;
const NAVY = "8, 47, 74";
const CONFERENCE_DAY = Date.UTC(2026, 9, 9);

type Item = { meta?: string; label: string; detail?: string };

type Slide =
  | { kind: "cover"; photo: string; line: string }
  | { kind: "photo"; photo: string; eyebrow: string; title: string; body?: string; items?: Item[]; logo?: false }
  | { kind: "speakers"; eyebrow: string; title: string; speakers: Speaker[] };

type Carousel = {
  days: number;
  topic: string;
  caption: string;
  slides: Slide[];
};

const HASHTAGS = "#psychedelicscience #psychedelicresearch #ALPSconference #Aarau";

function talksOn(day: string): Speaker[] {
  const items = PROGRAM.find((programDay) => programDay.day === day)?.items ?? [];
  return items.flatMap((item) => {
    const speaker = item.speakerName ? speakerByName(item.speakerName) : undefined;
    return speaker ? [speaker] : [];
  });
}

/** "A, B and C" */
function listNames(names: readonly string[]) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// Short enough for two lines under a portrait; the site keeps the full form.
const AFFILIATION_OVERRIDES: Record<string, string> = {
  "Dr. Sandeep Nayak": "Johns Hopkins University",
  "Prof. Amandine Luquiens": "University of Montpellier",
};

function shortAffiliation(speaker: Speaker) {
  return AFFILIATION_OVERRIDES[speaker.name] ?? speaker.institution.split(" - ")[0].split(",")[0];
}

const FRIDAY_TALKS = talksOn("Friday");
const SATURDAY_TALKS = talksOn("Saturday");
const TALK_COUNT = FRIDAY_TALKS.length + SATURDAY_TALKS.length;

const CAROUSELS: Carousel[] = [
  {
    days: 7,
    topic: "The conference",
    caption: `Seven days to go. On 9–10 October, ALPS 2026 brings ${TALK_COUNT} talks, two panel discussions and research posters to the Kultur & Kongresshaus Aarau.

Open to students, researchers, clinicians and anyone curious about psychedelic science. Psychologists and medical professionals can earn up to 14 FSP and 10 SGPP credits.

Tickets: alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "hall-audience", line: "Two days of psychedelic science in Aarau." },
      {
        kind: "photo",
        photo: "talk-stage",
        eyebrow: "The conference",
        title: "Two days of psychedelic science",
        body: `${TALK_COUNT} talks by researchers and clinicians, two panel discussions and research posters.`,
      },
      {
        kind: "photo",
        photo: "audience-applause",
        eyebrow: "Who it is for",
        title: "Anyone curious about the research",
        body: "Students, researchers, clinicians and the public. Talks are in English. Up to 14 FSP and 10 SGPP credits.",
      },
      {
        kind: "photo",
        photo: "crowd-above",
        eyebrow: "Tickets",
        title: "Two-day tickets at alpsconference.com",
        body: "Lunch, coffee breaks, the networking apéro and the afterparty are included. Student tickets available.",
      },
    ],
  },
  {
    days: 6,
    topic: "The speakers",
    caption: `Six days to go: meet the speakers of ALPS 2026.

Friday: ${listNames(FRIDAY_TALKS.map((speaker) => speaker.name))}.

Saturday: ${listNames(SATURDAY_TALKS.map((speaker) => speaker.name))}.

Talk titles and abstracts: alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "audience-back", line: `Meet the ${TALK_COUNT} speakers.` },
      { kind: "speakers", eyebrow: "Friday 9 October", title: "Friday’s speakers", speakers: FRIDAY_TALKS },
      { kind: "speakers", eyebrow: "Saturday 10 October", title: "Saturday’s speakers", speakers: SATURDAY_TALKS },
    ],
  },
  {
    days: 5,
    topic: "Panels and posters",
    caption: `Five days to go. Beyond the talks, ALPS 2026 has two panel discussions and research posters.

Friday, 18:15: The “therapy” in psychedelic-assisted therapy, with ${listNames(FRIDAY_PANEL_SPEAKER_NAMES)}.

Saturday, 18:00: Psychedelics and spirituality, with ${listNames(SATURDAY_PANEL_SPEAKER_NAMES)}.

Full program: alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "panel-stage", line: "Beyond the talks: two panel discussions and research posters." },
      {
        kind: "photo",
        photo: "audience-question",
        eyebrow: "Friday panel · 18:15",
        title: "The “therapy” in psychedelic-assisted therapy",
        body: `With ${listNames(FRIDAY_PANEL_SPEAKER_NAMES)}.`,
      },
      {
        kind: "photo",
        photo: "listening",
        eyebrow: "Saturday panel · 18:00",
        title: "Psychedelics and spirituality",
        body: `Ontological shifts and meaning-making, with ${listNames(SATURDAY_PANEL_SPEAKER_NAMES)}.`,
      },
      {
        kind: "photo",
        photo: "poster-discussion",
        eyebrow: "Research posters",
        title: "Ask the people who did the work",
        body: "Posters with new findings are on show at the venue. Find the authors between sessions.",
      },
    ],
  },
  {
    days: 4,
    topic: "Experiences and art",
    caption: `Four days to go. Between the talks: sound meditation, yoga, breathwork, speed-friending, storytelling and a live concert, with LSD blotter art and live painting on show.

Times and details: alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "sound-meditation", line: "Sound, movement and art between the talks." },
      {
        kind: "photo",
        photo: "sound-bath",
        eyebrow: "Friday 9 October",
        title: "Experiences",
        items: [
          { label: "Sound meditation", detail: "Marina Vovk · 11:00 and 14:30" },
          { label: "Speed-friending", detail: "Kate Dalby · 13:45" },
          { label: "Storytelling", detail: "Kate Dalby · 20:15" },
        ],
      },
      {
        kind: "photo",
        photo: "handpan",
        eyebrow: "Saturday 10 October",
        title: "Experiences",
        items: [
          { label: "Yoga", detail: "Andrea Bacconi · 08:10" },
          { label: "Breathwork", detail: "Pascal Kälin · 11:15 and 16:45" },
          { label: "Live concert", detail: "David & Anna-Lea Wennberg · 12:30" },
          { label: "Sound meditation", detail: "Marina Vovk · 13:45" },
        ],
      },
      {
        kind: "photo",
        photo: "live-painting",
        eyebrow: "On both days",
        title: "Art",
        items: [
          { label: "Kevin Barron", detail: "LSD blotter art" },
          { label: "Joanne Lackey", detail: "Exhibition and live painting" },
          { label: "Hana Stanke", detail: "Live painting" },
          { label: "Régis Paroz", detail: "Uncanny World" },
        ],
      },
    ],
  },
  {
    days: 3,
    topic: "Workshop Day",
    caption: `Three days to go, and the day before the conference is Workshop Day: ${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date}, ${WORKSHOP_DAY.time}. Three parallel tracks in psychedelic-assisted therapy, in ${listNames(WORKSHOP_TRACKS.map((track) => track.language))}.

Open to everyone. 4 FSP credits for medical professionals and psychologists. Seats are limited.

Book: alpsconference.com/workshops (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "circle", line: `Workshop Day comes first, on ${WORKSHOP_DAY.date}.` },
      {
        kind: "photo",
        photo: "table-talk",
        eyebrow: `${WORKSHOP_DAY.day} ${WORKSHOP_DAY.date} · ${WORKSHOP_DAY.time}`,
        title: "Three parallel tracks",
        items: WORKSHOP_TRACKS.map((track) => ({
          meta: track.language,
          label: track.title.split(" - ")[0],
          detail: track.presenters,
        })),
      },
      {
        kind: "photo",
        photo: "conversation",
        eyebrow: "Workshop Day",
        title: "4 FSP credits, open to everyone",
        body: "For clinicians, researchers, students and anyone interested in psychedelic-assisted therapy. Seats are limited.",
      },
    ],
  },
  {
    days: 2,
    topic: "The venue",
    caption: `Two days to go. We are back at the Kultur & Kongresshaus Aarau, Schlossplatz 9, steps from Aarau station.

Doors open at 08:00 on Friday with coffee and pastries. The opening starts at 09:00. Lunch and coffee breaks are included, mainly vegetarian with vegan options.

alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "hall-stage", line: "Back at the Kultur & Kongresshaus Aarau." },
      {
        kind: "photo",
        photo: "kuk-entrance",
        eyebrow: "Getting there",
        title: "Steps from Aarau station",
        body: "Kultur & Kongresshaus Aarau, Schlossplatz 9, 5000 Aarau. The building is wheelchair accessible.",
      },
      {
        kind: "photo",
        photo: "lunch-service",
        eyebrow: "Food",
        title: "Lunch and coffee breaks included",
        body: "Mainly vegetarian, with vegan options. Pastries from a local bakery when the doors open.",
      },
      {
        kind: "photo",
        photo: "badges",
        eyebrow: "Friday 9 October",
        title: "Doors open at 08:00",
        body: "Collect your badge, have a coffee and find a seat. The opening starts at 09:00.",
      },
    ],
  },
  {
    days: 1,
    topic: "See you in Aarau",
    caption: `Tomorrow. A year ago we closed with “see you next year in Aarau”.

Friday evening: an optional networking dinner at 19:15 (pre-sale on Infomaniak or at the ALPS info table), then storytelling with Kate Dalby. Saturday: the networking apéro at 19:30 and the afterparty at Jugendkulturhaus Flösserplatz from 21:30.

Tickets: alpsconference.com (link in bio)

${HASHTAGS}`,
    slides: [
      { kind: "cover", photo: "good-company", line: "See you in Aarau." },
      {
        kind: "photo",
        photo: "evening-drinks",
        eyebrow: "Friday evening",
        title: "Stay for dinner",
        items: [
          { meta: "19:15", label: "Networking dinner", detail: "Pre-sale on Infomaniak or at the ALPS info table" },
          { meta: "20:15", label: "Storytelling", detail: "Kate Dalby" },
        ],
      },
      {
        kind: "photo",
        photo: "afterparty",
        eyebrow: "Saturday night",
        title: "Apéro and afterparty",
        items: [
          { meta: "19:30", label: "Networking apéro", detail: "At the venue" },
          { meta: "21:30", label: "Afterparty", detail: "Jugendkulturhaus Flösserplatz, 5 minutes on foot" },
        ],
      },
      {
        kind: "photo",
        photo: "see-you-in-aarau",
        eyebrow: "A year ago",
        title: "We said see you in Aarau",
        body: "See you tomorrow. Tickets at alpsconference.com.",
        // The logo would sit on the projected "see you next year" line; the
        // ALPS banner on the stage stands in for it.
        logo: false,
      },
    ],
  },
];

// ——— Drawing ———

const font = (weight: number, size: number) => `${weight} ${size}px Switzer, system-ui, sans-serif`;
const white = (alpha = 1) => `rgba(255, 255, 255, ${alpha})`;
const navy = (alpha: number) => `rgba(${NAVY}, ${alpha})`;

/** Curly apostrophes and quotes for anything that came from data as straight ones. */
function typeset(text: string) {
  return text.replace(/(\w)'(\w)/g, "$1’$2").replace(/"([^"]*)"/g, "“$1”");
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Uppercase, letter-spaced eyebrow; returns its width. Drawn glyph by glyph so it works without ctx.letterSpacing. */
function drawEyebrow(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, size: number, alpha = 0.85, draw = true) {
  ctx.font = font(600, size);
  const tracking = size * 0.18;
  let left = x;
  for (const char of text.toUpperCase()) {
    if (draw) {
      ctx.fillStyle = white(alpha);
      ctx.fillText(char, left, y);
    }
    left += ctx.measureText(char).width + tracking;
  }
  return left - x - tracking;
}

function drawChrome(ctx: CanvasRenderingContext2D, logo: HTMLImageElement, pill: string, { showLogo = true } = {}) {
  const logoWidth = 210;
  const logoHeight = (logoWidth * logo.naturalHeight) / logo.naturalWidth;
  if (showLogo) ctx.drawImage(logo, MARGIN, MARGIN, logoWidth, logoHeight);

  // The countdown pill, top right, centred on the logo.
  const size = 19;
  const textWidth = drawEyebrow(ctx, pill, 0, 0, size, 1, false);
  const pillHeight = 50;
  const pillWidth = textWidth + 48;
  const pillX = W - MARGIN - pillWidth;
  const pillY = MARGIN + logoHeight / 2 - pillHeight / 2;
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = white(0.75);
  ctx.stroke();
  drawEyebrow(ctx, pill, pillX + 24, pillY + pillHeight / 2 + size * 0.36, size, 1);
}

const FOOTER_BASELINE = H - 64;
const RULE_Y = FOOTER_BASELINE - 50;
const CONTENT_BOTTOM = RULE_Y - 56;

function drawFooter(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = white(0.3);
  ctx.fillRect(MARGIN, RULE_Y, CONTENT_WIDTH, 1.5);
  ctx.font = font(400, 23);
  ctx.fillStyle = white(0.85);
  ctx.textAlign = "left";
  ctx.fillText("9–10 October 2026 · Kultur & Kongresshaus Aarau", MARGIN, FOOTER_BASELINE);
  ctx.font = font(600, 23);
  ctx.fillStyle = white();
  ctx.textAlign = "right";
  ctx.fillText("alpsconference.com", W - MARGIN, FOOTER_BASELINE);
  ctx.textAlign = "left";
}

/** Navy at the top for the logo and at the bottom under the text, clear in between. */
function drawScrims(ctx: CanvasRenderingContext2D, textTop: number) {
  ctx.fillStyle = navy(0.12);
  ctx.fillRect(0, 0, W, H);

  const top = ctx.createLinearGradient(0, 0, 0, 380);
  top.addColorStop(0, navy(0.72));
  top.addColorStop(0.45, navy(0.4));
  top.addColorStop(1, navy(0));
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 380);

  const start = Math.max(0, textTop - 340);
  const bottom = ctx.createLinearGradient(0, start, 0, H);
  bottom.addColorStop(0, navy(0));
  bottom.addColorStop(Math.min(0.95, (textTop - start) / (H - start)), navy(0.66));
  bottom.addColorStop(1, navy(0.92));
  ctx.fillStyle = bottom;
  ctx.fillRect(0, start, W, H - start);
}

type Line = { text: string; font: string; size: number; lineHeight: number; alpha: number; eyebrow?: boolean };
type Block = { lines: Line[]; gapAfter: number };

function textBlock(ctx: CanvasRenderingContext2D, text: string, weight: number, size: number, lineHeight: number, alpha: number, gapAfter: number): Block {
  ctx.font = font(weight, size);
  const lines = wrapLines(ctx, typeset(text), CONTENT_WIDTH).map((line) => ({ text: line, font: font(weight, size), size, lineHeight, alpha }));
  return { lines, gapAfter };
}

function eyebrowBlock(text: string, gapAfter: number): Block {
  return { lines: [{ text, font: font(600, 21), size: 21, lineHeight: 30, alpha: 0.85, eyebrow: true }], gapAfter };
}

function blocksHeight(blocks: Block[]) {
  return blocks.reduce((sum, block, i) => {
    const lines = block.lines.reduce((total, line) => total + line.lineHeight, 0);
    return sum + lines + (i < blocks.length - 1 ? block.gapAfter : 0);
  }, 0);
}

function drawBlocks(ctx: CanvasRenderingContext2D, blocks: Block[], top: number) {
  let y = top;
  blocks.forEach((block) => {
    block.lines.forEach((line) => {
      // Cap height sits in the middle of the line box.
      const baseline = y + line.lineHeight / 2 + line.size * 0.36;
      if (line.eyebrow) {
        drawEyebrow(ctx, line.text, MARGIN, baseline, line.size, line.alpha);
      } else {
        ctx.font = line.font;
        ctx.fillStyle = white(line.alpha);
        ctx.fillText(line.text, MARGIN, baseline);
      }
      y += line.lineHeight;
    });
    y += block.gapAfter;
  });
}

function pillText(days: number) {
  return days === 1 ? "Tomorrow" : `${days} days to go`;
}

async function drawCoverSlide(ctx: CanvasRenderingContext2D, slide: Extract<Slide, { kind: "cover" }>, carousel: Carousel) {
  const [photo, logo] = await Promise.all([loadImage(`img/countdown/${slide.photo}.jpg`), loadImage("img/logo.png")]);
  drawCover(ctx, photo, W, H);

  const line = textBlock(ctx, slide.line, 600, 44, 56, 1, 0);
  const lineTop = CONTENT_BOTTOM - blocksHeight([line]);
  const lockupBaseline = lineTop - 44;

  // The lockup: a big numeral with "days / to go" beside it, or "Tomorrow".
  let lockupTop: number;
  ctx.fillStyle = white();
  if (carousel.days > 1) {
    ctx.font = font(900, 620);
    const numeral = String(carousel.days);
    const metrics = ctx.measureText(numeral);
    const numeralX = MARGIN + metrics.actualBoundingBoxLeft;
    lockupTop = lockupBaseline - metrics.actualBoundingBoxAscent;
    const wordsX = numeralX + metrics.actualBoundingBoxRight + 36;
    // Everything after the numeral is drawn once the scrim is down.
    drawScrims(ctx, lockupTop - 60);
    ctx.fillStyle = white();
    ctx.font = font(900, 620);
    ctx.fillText(numeral, numeralX, lockupBaseline);
    ctx.font = font(900, 124);
    ctx.fillText("days", wordsX, lockupBaseline - 132);
    ctx.fillText("to go", wordsX, lockupBaseline);
  } else {
    ctx.font = font(900, 200);
    const fit = Math.min(200, (200 * CONTENT_WIDTH) / ctx.measureText("Tomorrow").width);
    ctx.font = font(900, fit);
    const metrics = ctx.measureText("Tomorrow");
    lockupTop = lockupBaseline - metrics.actualBoundingBoxAscent;
    drawScrims(ctx, lockupTop - 60);
    ctx.fillStyle = white();
    ctx.font = font(900, fit);
    ctx.fillText("Tomorrow", MARGIN + metrics.actualBoundingBoxLeft, lockupBaseline);
  }

  drawEyebrow(ctx, "Countdown to ALPS 2026", MARGIN, lockupTop - 44, 21);
  drawBlocks(ctx, [line], lineTop);
  drawChrome(ctx, logo, "9–10 October 2026");
  drawFooter(ctx);
}

async function drawPhotoSlide(ctx: CanvasRenderingContext2D, slide: Extract<Slide, { kind: "photo" }>, carousel: Carousel) {
  const [photo, logo] = await Promise.all([loadImage(`img/countdown/${slide.photo}.jpg`), loadImage("img/logo.png")]);
  drawCover(ctx, photo, W, H);

  const blocks: Block[] = [eyebrowBlock(slide.eyebrow, 22), textBlock(ctx, slide.title, 900, 80, 86, 1, 30)];
  if (slide.body) blocks.push(textBlock(ctx, slide.body, 400, 34, 46, 0.92, 0));
  slide.items?.forEach((item, i) => {
    const last = i === slide.items!.length - 1;
    if (item.meta) blocks.push(eyebrowBlock(item.meta, 2));
    const label = textBlock(ctx, item.label, 600, 36, 44, 1, item.detail ? 2 : 30);
    blocks.push(label);
    if (item.detail) blocks.push(textBlock(ctx, item.detail, 400, 28, 38, 0.82, last ? 0 : 30));
  });

  const top = CONTENT_BOTTOM - blocksHeight(blocks);
  drawScrims(ctx, top);
  drawBlocks(ctx, blocks, top);
  drawChrome(ctx, logo, pillText(carousel.days), { showLogo: slide.logo !== false });
  drawFooter(ctx);
}

async function drawSpeakerSlide(ctx: CanvasRenderingContext2D, slide: Extract<Slide, { kind: "speakers" }>, carousel: Carousel) {
  const [logo, ...portraits] = await Promise.all([
    loadImage("img/logo.png"),
    ...slide.speakers.map((speaker) => loadImage(`img/speakers/${speaker.image}`)),
  ]);

  // The published conference posts' navy-to-cornflower sweep with a pink glow.
  const sweep = ctx.createLinearGradient(0, 0, W, H);
  sweep.addColorStop(0, "#0E3D5E");
  sweep.addColorStop(0.6, "#22537A");
  sweep.addColorStop(1, "#2D6BA3");
  ctx.fillStyle = sweep;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.08, H * 0.98, 0, W * 0.08, H * 0.98, 640);
  glow.addColorStop(0, "rgba(239, 151, 195, 0.42)");
  glow.addColorStop(1, "rgba(239, 151, 195, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  drawEyebrow(ctx, slide.eyebrow, MARGIN, 252, 21);
  ctx.font = font(900, 72);
  ctx.fillStyle = white();
  ctx.fillText(typeset(slide.title), MARGIN, 330);

  const columns = 3;
  const gap = 24;
  const columnWidth = (CONTENT_WIDTH - gap * (columns - 1)) / columns;
  const portraitHeight = 300;
  let rowTop = 372;
  for (let row = 0; row * columns < slide.speakers.length; row++) {
    const rowSpeakers = slide.speakers.slice(row * columns, row * columns + columns);
    let rowHeight = 0;
    rowSpeakers.forEach((speaker, i) => {
      const x = MARGIN + i * (columnWidth + gap);
      const [left, top, width, height] = getImageCrop(speaker.image).faceBox;
      drawCover(ctx, portraits[row * columns + i], columnWidth, portraitHeight, {
        x,
        y: rowTop,
        focusX: (left + width / 2) / 100,
        focusY: (top + height / 2) / 100,
      });

      let y = rowTop + portraitHeight + 16;
      ctx.font = font(600, 25);
      ctx.fillStyle = white();
      wrapLines(ctx, speaker.name, columnWidth).forEach((line) => {
        ctx.fillText(line, x, y + 24);
        y += 30;
      });
      y += 4;
      ctx.font = font(400, 20);
      ctx.fillStyle = white(0.78);
      wrapLines(ctx, shortAffiliation(speaker), columnWidth)
        .slice(0, 2)
        .forEach((line) => {
          ctx.fillText(line, x, y + 19);
          y += 25;
        });
      rowHeight = Math.max(rowHeight, y - rowTop);
    });
    rowTop += rowHeight + 30;
  }

  drawChrome(ctx, logo, pillText(carousel.days));
  drawFooter(ctx);
}

async function drawSlide(ctx: CanvasRenderingContext2D, slide: Slide, carousel: Carousel) {
  await Promise.all([600, 400, 900].map((weight) => document.fonts.load(font(weight, 30))));
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingQuality = "high";
  ctx.textBaseline = "alphabetic";
  ctx.clearRect(0, 0, W, H);
  if (slide.kind === "cover") await drawCoverSlide(ctx, slide, carousel);
  else if (slide.kind === "photo") await drawPhotoSlide(ctx, slide, carousel);
  else await drawSpeakerSlide(ctx, slide, carousel);
}

// ——— Page ———

function slug(carousel: Carousel) {
  return carousel.days === 1 ? "tomorrow" : `${carousel.days}-days`;
}

function postingDate(days: number) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(CONFERENCE_DAY - days * 86_400_000)
  );
}

const fileName = (carousel: Carousel, index: number) => `alps-2026-countdown-${slug(carousel)}-${index + 1}`;

const buttonClass =
  "inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-40";
const smallButtonClass =
  "inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-40";

function SlideCard({
  carousel,
  slide,
  index,
  onCanvas,
}: {
  carousel: Carousel;
  slide: Slide;
  index: number;
  onCanvas: (index: number, canvas: HTMLCanvasElement | null) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"drawing" | "ready" | "error">("drawing");

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let cancelled = false;
    drawSlide(ctx, slide, carousel)
      .then(() => {
        if (cancelled) return;
        setStatus("ready");
        onCanvas(index, canvasRef.current);
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [carousel, slide, index, onCanvas]);

  const save = (type: ImageType) => canvasRef.current && downloadCanvas(canvasRef.current, fileName(carousel, index), type);

  return (
    <figure className="w-60 shrink-0 snap-start space-y-2 sm:w-72">
      <canvas
        ref={canvasRef}
        width={W * SCALE}
        height={H * SCALE}
        className="block h-auto w-full border border-white/15"
        aria-label={`${pillText(carousel.days)}: ${carousel.topic}, slide ${index + 1} of ${carousel.slides.length}`}
      />
      <figcaption className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium tracking-[0.18em] text-white/60 uppercase">Slide {index + 1}</span>
        <span className="flex gap-1.5">
          <button type="button" className={smallButtonClass} disabled={status !== "ready"} onClick={() => save("image/jpeg")}>
            JPG
          </button>
          <button type="button" className={smallButtonClass} disabled={status !== "ready"} onClick={() => save("image/png")}>
            PNG
          </button>
        </span>
      </figcaption>
      {status === "error" && <p className="text-sm text-accent">An image failed to load. Reload the page to try again.</p>}
    </figure>
  );
}

function CarouselSection({ carousel }: { carousel: Carousel }) {
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const [readyCount, setReadyCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const allReady = readyCount === carousel.slides.length;

  const onCanvas = useRef((index: number, canvas: HTMLCanvasElement | null) => {
    if (!canvases.current[index] && canvas) setReadyCount((count) => count + 1);
    canvases.current[index] = canvas;
  }).current;

  // Browsers drop downloads fired in the same tick, so they go out one by one.
  const downloadAll = async () => {
    for (const [index, canvas] of canvases.current.entries()) {
      if (!canvas) continue;
      downloadCanvas(canvas, fileName(carousel, index), "image/jpeg");
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  };

  const copyCaption = async () => {
    try {
      await navigator.clipboard.writeText(carousel.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="space-y-5 border-t border-white/15 pt-8" aria-labelledby={`carousel-${slug(carousel)}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium tracking-[0.18em] text-white/60 uppercase">Post on {postingDate(carousel.days)}</p>
          <h2 id={`carousel-${slug(carousel)}`} className="mt-1 text-xl font-semibold text-white">
            {pillText(carousel.days)} · {carousel.topic}
          </h2>
        </div>
        <button type="button" className={`${buttonClass} bg-white text-primary hover:bg-white/85`} disabled={!allReady} onClick={downloadAll}>
          <Download size={16} strokeWidth={1.75} />
          Download {carousel.slides.length} slides
        </button>
      </div>
      <div className="-mx-4 flex snap-x scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
        {carousel.slides.map((slide, index) => (
          <SlideCard key={index} carousel={carousel} slide={slide} index={index} onCanvas={onCanvas} />
        ))}
      </div>
      <details className="group rounded-sm border border-white/15 bg-white/5">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white/85">Caption</summary>
        <div className="space-y-3 border-t border-white/10 px-4 py-4">
          <p className="text-sm whitespace-pre-line text-white/80">{carousel.caption}</p>
          <button type="button" className={buttonClass} onClick={copyCaption}>
            {copied ? <Check size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
            {copied ? "Copied" : "Copy caption"}
          </button>
        </div>
      </details>
    </section>
  );
}

export default function CountdownPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-3">
        <img src={withBase("img/logo.png")} alt="ALPS Research Conference" className="h-9 w-auto" />
        <h1 className="text-3xl font-black text-white sm:text-4xl">Countdown to ALPS 2026</h1>
        <p className="max-w-2xl text-white/75">
          One carousel for each of the last seven days before the conference, 1080 × 1350 for Instagram and LinkedIn,
          downloaded at twice that size. Post them in order, one a day, with the caption under each.
        </p>
      </header>
      {CAROUSELS.map((carousel) => (
        <CarouselSection key={carousel.days} carousel={carousel} />
      ))}
    </main>
  );
}
