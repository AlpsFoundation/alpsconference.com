import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { downloadCanvas, drawCover, loadImage } from "../lib/canvasImage";
import { withBase } from "../lib/withBase";

// Fixed-size banners for the newsletter and other channels. Each one is drawn
// on a canvas at its export size, so the preview is exactly the file that is
// downloaded. Add a banner by appending to BANNERS.

type Banner = {
  id: string;
  title: string;
  usage: string;
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => Promise<void>;
};

type TextRun = { text: string; weight: number; opacity?: number };

/** One line of Switzer in several weights, centred on x. */
function drawCentredLine(ctx: CanvasRenderingContext2D, runs: TextRun[], x: number, y: number, size: number) {
  const font = (weight: number) => `${weight} ${size}px Switzer, system-ui, sans-serif`;
  const widths = runs.map((run) => {
    ctx.font = font(run.weight);
    return ctx.measureText(run.text).width;
  });
  let left = x - widths.reduce((sum, w) => sum + w, 0) / 2;
  ctx.textBaseline = "alphabetic";
  runs.forEach((run, i) => {
    ctx.font = font(run.weight);
    ctx.fillStyle = `rgba(255, 255, 255, ${run.opacity ?? 1})`;
    ctx.fillText(run.text, left, y);
    left += widths[i];
  });
}

/** Luminance-weighted greyscale over the whole canvas. */
function desaturate(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height);
  const px = image.data;
  for (let i = 0; i < px.length; i += 4) {
    const luma = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    px[i] = px[i + 1] = px[i + 2] = luma;
  }
  ctx.putImageData(image, 0, 0);
}

const BANNERS: Banner[] = [
  {
    id: "newsletter-venue",
    title: "Newsletter header: venue",
    usage: "Top of the conference newsletter. Logo, dates and venue over the Kultur & Kongresshaus Aarau at dusk.",
    width: 1200,
    height: 400,
    async draw(ctx, width, height) {
      const [photo, logo] = await Promise.all([
        loadImage("img/kuk-outside.jpg"),
        loadImage("img/logo.png"),
        document.fonts.load("600 30px Switzer"),
        document.fonts.load("400 30px Switzer"),
      ]);

      // The middle of the building, from the roofline down to the entrance steps.
      drawCover(ctx, photo, width, height, { focusY: 0.585 });

      // Deepens the sky into the site's navy and settles a soft pool of it
      // behind the logo and dates so they read over the facade.
      const sky = ctx.createLinearGradient(0, 0, 0, height * 0.75);
      sky.addColorStop(0, "rgba(8, 47, 74, 0.75)");
      sky.addColorStop(1, "rgba(8, 47, 74, 0)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(2.4, 1);
      const pool = ctx.createRadialGradient(0, 0, 0, 0, 0, height * 0.45);
      pool.addColorStop(0, "rgba(8, 47, 74, 0.7)");
      pool.addColorStop(0.55, "rgba(8, 47, 74, 0.45)");
      pool.addColorStop(1, "rgba(8, 47, 74, 0)");
      ctx.fillStyle = pool;
      ctx.fillRect(-width, -height, width * 2, height * 2);
      ctx.restore();

      const logoWidth = width * 0.28;
      const logoHeight = (logoWidth * logo.naturalHeight) / logo.naturalWidth;
      // The block, from the top of the logo to the date's baseline, sits in the middle.
      const lineGap = height * 0.115; // logo bottom to the date's baseline
      const logoTop = (height - logoHeight - lineGap) / 2;
      ctx.drawImage(logo, (width - logoWidth) / 2, logoTop, logoWidth, logoHeight);

      drawCentredLine(
        ctx,
        [
          { text: "9–10 October 2026", weight: 600 },
          { text: "  ·  Kultur & Kongresshaus Aarau", weight: 400, opacity: 0.88 },
        ],
        width / 2,
        logoTop + logoHeight + lineGap,
        30
      );
    },
  },
];

function BannerCard({ banner }: { banner: Banner }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"drawing" | "ready" | "error">("drawing");
  const [monochrome, setMonochrome] = useState(false);
  const fileName = `alps-conference-2026-${banner.id}${monochrome ? "-monochrome" : ""}`;

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    let cancelled = false;
    setStatus("drawing");
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, banner.width, banner.height);
    banner
      .draw(ctx, banner.width, banner.height)
      .then(() => {
        if (cancelled) return;
        if (monochrome) desaturate(ctx, banner.width, banner.height);
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, [banner, monochrome]);

  const buttonClass =
    "inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/10 disabled:opacity-40";

  return (
    <article className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{banner.title}</h2>
          <p className="mt-1 text-sm text-white/70">{banner.usage}</p>
        </div>
        <p className="text-xs font-medium tracking-[0.18em] text-white/60 uppercase">
          {banner.width} × {banner.height} px
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={banner.width}
        height={banner.height}
        className="block h-auto w-full border border-white/15"
        aria-label={`${banner.title}${monochrome ? ", monochrome" : ""}`}
      />
      {status === "error" && <p className="text-sm text-accent">An image failed to load. Reload the page to try again.</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={`${buttonClass} bg-white text-primary hover:bg-white/85`}
          disabled={status !== "ready"}
          onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, fileName, "image/jpeg")}
        >
          <Download size={16} strokeWidth={1.75} />
          Download JPG
        </button>
        <button
          type="button"
          className={buttonClass}
          disabled={status !== "ready"}
          onClick={() => canvasRef.current && downloadCanvas(canvasRef.current, fileName, "image/png")}
        >
          <Download size={16} strokeWidth={1.75} />
          Download PNG
        </button>
        <label className="ml-auto inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-white/85">
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={monochrome}
            onChange={(event) => setMonochrome(event.target.checked)}
          />
          <span className="relative h-6 w-11 rounded-full border border-white/30 bg-white/10 transition-colors peer-checked:bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-white after:absolute after:top-0.5 after:left-0.5 after:h-4.5 after:w-4.5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5 peer-checked:after:bg-primary" />
          Monochrome
        </label>
      </div>
    </article>
  );
}

export default function BannersPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <header className="space-y-3">
        <img src={withBase("img/logo.png")} alt="ALPS Research Conference" className="h-9 w-auto" />
        <h1 className="text-3xl font-black text-white sm:text-4xl">Banners</h1>
        <p className="max-w-2xl text-white/75">
          Download a banner and upload it where it's used. JPG is smaller and works in every email client; PNG is
          lossless. Switch on monochrome for a desaturated version.
        </p>
      </header>
      {BANNERS.map((banner) => (
        <BannerCard key={banner.id} banner={banner} />
      ))}
    </main>
  );
}
