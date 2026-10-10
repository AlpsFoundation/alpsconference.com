import { useEffect, useRef, useState, type CSSProperties } from "react";
import { withBase } from "../lib/withBase";
import { qrPath } from "./signage/qr";

/**
 * The participant survey as a game on the break slides (Gerel wants 80–90 answers, Matthias 10 Oct):
 * every answer draws a little more of last year's spore print (ALPS Conference 2025 › 05_Communications
 * › Spores › sporeJJ_1, cropped about its centre), clockwise round a full cycle centred on the pink
 * aura, and it grows slightly as it nears the goal. The count comes from a small Apps Script web
 * app on the form ("CONF26 survey response count (break slides)" in Matthias's
 * `_ALPS Apps Script & Forms` folder), polled every 30 s. Until a count arrives — or if it never
 * does — the slide keeps its 3D synapse and only the survey's QR card shows.
 */
export const SURVEY_URL = "https://forms.gle/2x7qh65Jna1PS5Px5";
export const SURVEY_GOAL = 90;
const COUNT_URL =
  "https://script.google.com/macros/s/AKfycbye-bawSK3lzYrP4ykOXYb04yePGRiIT3hAHHa8sbOBnptIFSI7u4JGU-oRXNbarE66/exec";
const POLL_MS = 30_000;

const SURVEY_QR = qrPath(SURVEY_URL, "M");
const QR_QUIET = 4;

/** The survey's response count, or null while unknown. `?survey=<n>` fakes it for testing. */
export function useSurveyCount(enabled: boolean): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const fake = new URLSearchParams(window.location.search).get("survey");
    if (fake !== null && fake !== "" && !Number.isNaN(Number(fake))) {
      setCount(Number(fake));
      return;
    }
    if (!COUNT_URL) return;
    let stopped = false;
    const load = async () => {
      try {
        const res = await fetch(`${COUNT_URL}?t=${Date.now()}`, { cache: "no-store" });
        const data = (await res.json()) as { count?: unknown };
        if (!stopped && typeof data.count === "number") setCount(data.count);
      } catch {
        /* keep the last count */
      }
    };
    void load();
    const timer = window.setInterval(load, POLL_MS);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [enabled]);
  return count;
}

/** Last year's spore print, revealed clockwise in proportion to the answers so far. */
export function SurveySpore({ count, center }: { count: number; center: readonly [number, number] }) {
  const progress = Math.max(0, Math.min(1, count / SURVEY_GOAL));
  // Start empty, then ease to the count, so the slide opens on the spore print drawing itself.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  const done = count >= SURVEY_GOAL;
  return (
    <div
      className={`break-survey ${done ? "is-done" : ""}`}
      style={{ left: `${center[0] * 100}%`, top: `${center[1] * 100}%`, "--p": shown } as CSSProperties}
      aria-hidden
    >
      <div className="break-survey__art">
        <img className="break-survey__ghost" src={withBase("img/spore.webp")} alt="" />
        <img className="break-survey__fill" src={withBase("img/spore.webp")} alt="" />
      </div>
    </div>
  );
}

/** The survey's QR card, beside the links card on the break slides, with the answers so far right above it. */
export function SurveyQr({ count }: { count: number | null }) {
  const box = SURVEY_QR.size + QR_QUIET * 2;
  // A short pink glow on the number whenever a new answer comes in.
  const last = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count !== null && last.current !== null && count > last.current) setBump((b) => b + 1);
    last.current = count;
  }, [count]);
  const done = count !== null && count >= SURVEY_GOAL;
  return (
    <aside className="break-links break-links--survey" aria-label="Participant survey">
      {count !== null && (
        <p key={bump} className={`break-survey__count ${bump ? "is-bumped" : ""}`}>
          <small>{done ? "Goal reached, thank you!" : "Survey answers"}</small>
          <strong>{count}</strong>
          <span> / {SURVEY_GOAL}</span>
        </p>
      )}
      <p className="break-links__url">Survey · 2 min</p>
      <svg
        className="break-links__code"
        viewBox={`${-QR_QUIET} ${-QR_QUIET} ${box} ${box}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label="QR code for the participant survey"
      >
        <rect x={-QR_QUIET} y={-QR_QUIET} width={box} height={box} fill="#fff" />
        <path d={SURVEY_QR.d} fill="currentColor" />
      </svg>
    </aside>
  );
}
