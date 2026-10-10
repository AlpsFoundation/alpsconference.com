import { useEffect, useRef, useState, type CSSProperties } from "react";
import { withBase } from "../lib/withBase";
import { qrPath } from "./signage/qr";

/**
 * The participant survey as a game on the break slides (Gerel wants 80–90 answers, Matthias 10 Oct):
 * every answer fills a little more of the Bones synapse, clockwise about its centre on the pink
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

/**
 * A spore print made of synapses: the Bones artwork turned about its centre (the synaptic cleft)
 * in even steps, so its arms radiate like the gills of last year's spore prints.
 */
const ARMS = 12;
function Rosette({ className }: { className: string }) {
  const src = withBase("img/bones.svg");
  return (
    <div className={`break-survey__rosette ${className}`}>
      {Array.from({ length: ARMS }, (_, i) => (
        <img key={i} src={src} alt="" style={{ transform: `rotate(${(i * 180) / ARMS}deg)` }} />
      ))}
    </div>
  );
}

/** The Bones synapse, revealed clockwise in proportion to the answers so far. */
export function SurveyBones({ count, center }: { count: number; center: readonly [number, number] }) {
  const progress = Math.max(0, Math.min(1, count / SURVEY_GOAL));
  // Start empty, then ease to the count, so the slide opens on the synapse filling in.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress]);

  // A short glow on the caption whenever a new answer comes in.
  const last = useRef(count);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (count > last.current) setBump((b) => b + 1);
    last.current = count;
  }, [count]);

  const done = count >= SURVEY_GOAL;
  return (
    <div
      className={`break-survey ${done ? "is-done" : ""}`}
      style={{ left: `${center[0] * 100}%`, top: `${center[1] * 100}%`, "--p": shown } as CSSProperties}
      aria-hidden
    >
      <div className="break-survey__art">
        <Rosette className="break-survey__ghost" />
        <Rosette className="break-survey__fill" />
      </div>
      <p key={bump} className={`break-survey__count ${bump ? "is-bumped" : ""}`}>
        <small>{done ? "Goal reached, thank you!" : "Survey answers"}</small>
        <strong>{count}</strong>
        <span> / {SURVEY_GOAL}</span>
      </p>
    </div>
  );
}

/** The survey's QR card, beside the links card on the break slides. */
export function SurveyQr() {
  const box = SURVEY_QR.size + QR_QUIET * 2;
  return (
    <aside className="break-links break-links--survey" aria-label="Participant survey">
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
