/**
 * The architect's floor plan (public/img/venue-plan.svg), fetched once and shared
 * by every map on the site. It is inlined rather than shown as an <img> or SVG
 * <image>, so each map can recolour it with CSS by its original attribute colours.
 */
import { VENUE_PLAN_SRC } from "../data/venuePlan";
import { withBase } from "./withBase";

export type VenueDrawing = { drawing: string; walls: string };

let planPromise: Promise<VenueDrawing> | null = null;

export function loadVenueDrawing() {
  planPromise ??= fetch(withBase(VENUE_PLAN_SRC))
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
    // The export carries its own legend as magenta <text> glyphs; the legend
    // is rebuilt in HTML, so keep only the drawing layers.
    .then((raw) =>
      raw
        .replace(/^[\s\S]*?<svg[^>]*>/, "")
        .replace(/<\/svg>\s*$/, "")
        .replace(/<defs\s*\/>/, "")
        .replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, ""),
    )
    // The solid walls of the base layer, redrawn raised when the plan is tilted.
    .then((drawing) => {
      const base = drawing.match(/<g id="01_BASE_SIMPLIFIEE">([\s\S]*?)<\/g>/)?.[1] ?? "";
      const walls = base.match(/<path\b[^>]*fill="#000000"[^>]*\/>/g)?.join("") ?? "";
      return { drawing, walls };
    })
    .catch((err) => {
      planPromise = null;
      throw err;
    });
  return planPromise;
}
