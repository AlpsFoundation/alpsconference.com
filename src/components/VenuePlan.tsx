import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Coffee, Expand, Maximize2, Minus, Plus, Shirt, Toilet, X, type LucideIcon } from "lucide-react";
import {
  VENUE_COLOR_KNOBS,
  VENUE_LEGEND,
  VENUE_MARKERS,
  VENUE_PALETTES,
  VENUE_PLAN_VIEW as VIEW,
  VENUE_SECTIONS,
  type VenueColors,
  type VenueIcon,
  type VenueSection,
} from "../data/venuePlan";
import { loadVenueDrawing, type VenueDrawing } from "../lib/venuePlanDrawing";
import { withBase } from "../lib/withBase";
import "../styles/venue-plan.css";

/* ---------- drawing (fetched once, only when a plan scrolls into view) ---------- */

type Plan = VenueDrawing;

function usePlanWhenVisible(ref: RefObject<HTMLElement | null>) {
  const [plan, setPlan] = useState<Plan | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        loadVenueDrawing().then((p) => !cancelled && setPlan(p), () => {});
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io.disconnect();
    };
  }, [ref]);
  return plan;
}

/* ---------- design state ---------- */

type Design = {
  preset: string;
  colors: VenueColors;
  walls: "hatched" | "solid" | "outline";
  size: number;
  grid: boolean;
  /** Isometric tilt, 0 (flat, top-down) to 1. */
  tilt: number;
  /** Wall height multiplier for the tilted view. */
  height: number;
};

const DESIGN_KEY = "alps-venue-map-design";
const defaultDesign = (): Design => ({
  preset: "blueprint",
  colors: { ...VENUE_PALETTES.blueprint.colors },
  walls: "hatched",
  size: 1,
  grid: true,
  tilt: 0.5,
  height: 1,
});

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

function useDesign(persist: boolean) {
  const [design, setDesign] = useState<Design>(defaultDesign);
  const loaded = useRef(false);

  useEffect(() => {
    if (!persist) return;
    try {
      const saved = JSON.parse(localStorage.getItem(DESIGN_KEY) ?? "null");
      if (saved?.colors?.paper) setDesign({ ...defaultDesign(), ...saved });
    } catch {}
    loaded.current = true;
  }, [persist]);

  useEffect(() => {
    if (!persist || !loaded.current) return;
    try {
      localStorage.setItem(DESIGN_KEY, JSON.stringify(design));
    } catch {}
  }, [design, persist]);

  return [design, setDesign] as const;
}

/* ---------- lookup tables ---------- */

const sectionOf = new Map<number, (typeof VENUE_SECTIONS)[number]>();
const labelOf = new Map<number, string>();
const upstairs = new Set<number>();
const iconOf = new Map<number, VenueIcon>();
for (const s of VENUE_SECTIONS)
  for (const i of s.items) {
    // A marker listed twice (Saal 4 under ALPS and Lounges) is named by its first section.
    if (sectionOf.has(i.n)) continue;
    sectionOf.set(i.n, s);
    labelOf.set(i.n, i.label ?? s.title);
    if (i.upstairs) upstairs.add(i.n);
    if (i.icon) iconOf.set(i.n, i.icon);
  }

const ICONS: Record<VenueIcon, LucideIcon> = { toilet: Toilet, wardrobe: Shirt, coffee: Coffee };

/** Legend badge: the number (or pictogram), plus the stairs glyph for upstairs items. */
function Badge({ item }: { item: VenueSection["items"][number] }) {
  const Icon = item.icon ? ICONS[item.icon] : null;
  return (
    <span className={`vp-badge ${item.upstairs ? "vp-badge--stairs" : ""}`}>
      {Icon ? <Icon aria-hidden strokeWidth={2.2} /> : item.n}
      {item.upstairs && (
        <svg viewBox="-0.8 0.6 14.6 12.2" aria-label="upstairs">
          <StairsGlyph />
        </svg>
      )}
    </span>
  );
}

/** Solid staircase with an up arrow (13 × 12 box), drawn beside the number on upstairs markers. */
function StairsGlyph() {
  return (
    <>
      <path className="vp-stairs-steps" d="M4 12V8.5h3V5h3V1.5h3V12z" />
      <path className="vp-stairs-arrow" d="M2 11.5V2.4M0 4.4l2-2 2 2" />
    </>
  );
}

type View = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };
const MAX_ZOOM = 14;

/* ---------- isometric tilt ---------- */

// Stacked copies of the walls between the floor and their raised tops.
const WALL_LAYERS = 12;

type Tilt = {
  /** SVG transform that lays the drawing down: a rotation, then a vertical squash. */
  matrix: string;
  /** Where a point of the drawing lands once tilted (markers stay upright at that spot). */
  project: (p: Point) => Point;
  /** The tilted crop plus the raised walls: what "fit" shows. */
  frame: View;
  /** Wall height, in screen-aligned user units. */
  lift: number;
};

function tiltFor(t: number, height: number): Tilt {
  const angle = (-16 * t * Math.PI) / 180;
  const squash = 1 - 0.32 * t;
  const [a, b, c, d] = [Math.cos(angle), squash * Math.sin(angle), -Math.sin(angle), squash * Math.cos(angle)];
  // Pivot on the middle of the crop so the plan stays centred.
  const cx = VIEW.x + VIEW.w / 2;
  const cy = VIEW.y + VIEW.h / 2;
  const e = cx - (a * cx + c * cy);
  const f = cy - (b * cx + d * cy);
  const project = ({ x, y }: Point) => ({ x: a * x + c * y + e, y: b * x + d * y + f });
  const lift = 9 * t * height;
  const corners = [
    project({ x: VIEW.x, y: VIEW.y }),
    project({ x: VIEW.x + VIEW.w, y: VIEW.y }),
    project({ x: VIEW.x, y: VIEW.y + VIEW.h }),
    project({ x: VIEW.x + VIEW.w, y: VIEW.y + VIEW.h }),
  ];
  const xs = corners.map((p) => p.x);
  const ys = corners.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  return {
    matrix: `matrix(${[a, b, c, d, e, f].map((n) => +n.toFixed(5)).join(" ")})`,
    project,
    frame: { x: x0, y: y0 - lift, w: x1 - x0, h: y1 - y0 + lift },
    lift,
  };
}

function clampView(v: View, F: View): View {
  const w = Math.min(F.w, Math.max(F.w / MAX_ZOOM, v.w));
  const h = (w * F.h) / F.w;
  const cx = Math.min(F.x + F.w, Math.max(F.x, v.x + v.w / 2));
  const cy = Math.min(F.y + F.h, Math.max(F.y, v.y + v.h / 2));
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

/* ---------- component ---------- */

export type VenuePlanProps = {
  /** Show the numbered legend under the plan. */
  legend?: boolean;
  /** Offer the palette/colour/wall/marker design panel (persisted per browser) when the URL has ?design=1. */
  designControls?: boolean;
  /** For plans inside a scrolling page: ctrl/⌘ + wheel zooms, one finger scrolls until zoomed in. */
  cooperative?: boolean;
  /** Offer a button that opens the plan in a full-screen modal. */
  expandable?: boolean;
  /** "page": tall stage · "embed": 4:3 · "fill": fills a flex parent · "thumb": static preview. */
  size?: "page" | "embed" | "fill" | "thumb";
  className?: string;
};

export default function VenuePlan({
  legend = false,
  designControls = false,
  cooperative = false,
  expandable = false,
  size = "embed",
  className = "",
}: VenuePlanProps) {
  const interactive = size !== "thumb";
  // Pattern ids must be unique per instance (a thumbnail and its modal can share a page).
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const plan = usePlanWhenVisible(rootRef);
  // The design panel is a working tool: only offered with ?design=1 in the URL.
  const [showDesign, setShowDesign] = useState(false);
  useEffect(() => {
    setShowDesign(designControls && new URLSearchParams(location.search).get("design") === "1");
  }, [designControls]);
  const [design, setDesign] = useDesign(showDesign);
  const tilt = useMemo(() => tiltFor(design.tilt, design.height), [design.tilt, design.height]);
  const frame = useRef(tilt.frame);
  frame.current = tilt.frame;

  const view = useRef<View>({ ...tilt.frame });
  const anim = useRef(0);
  const moved = useRef(0);
  const sizeRef = useRef(design.size);
  sizeRef.current = design.size;
  const pinnedEl = useRef<SVGGElement | null>(null);
  const lastPointer = useRef("mouse");

  const [hover, setHover] = useState<number[] | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const [tip, setTip] = useState<{ n: number; left: number; top: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [wheelHint, setWheelHint] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const hot = hover ?? (pinned ? [pinned] : null);

  // Nudge the tooltip sideways so it never spills out of the stage (markers near the edges, narrow phones).
  const tipRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = tipRef.current;
    const stage = stageRef.current;
    if (!el || !stage || !tip) return;
    const half = el.offsetWidth / 2;
    const pad = 8;
    const left = Math.min(stage.clientWidth - pad - half, Math.max(pad + half, tip.left));
    el.style.setProperty("--dx", `${left - tip.left}px`);
  }, [tip]);

  /* --- view plumbing (direct DOM writes: pan/zoom runs every frame) --- */

  const scaleMarkers = useCallback(() => {
    const svg = svgRef.current;
    const ppu = svg?.getScreenCTM()?.a;
    if (!svg || !ppu) return;
    // Sized in screen pixels, growing a little on zoom, so markers stay
    // readable on a phone without ballooning on a big screen.
    const radiusPx = 12 * sizeRef.current * Math.min(1.5, Math.max(0.55, Math.pow(ppu / 1.3, 0.35)));
    const s = (radiusPx / (10.5 * ppu)).toFixed(4);
    svg.querySelectorAll(".vp-marker-scale").forEach((g) => g.setAttribute("transform", `scale(${s})`));
  }, []);

  const tipFor = useCallback((el: SVGGElement) => {
    const stage = stageRef.current;
    if (!stage) return null;
    const r = el.getBoundingClientRect();
    const host = stage.getBoundingClientRect();
    return { n: Number(el.dataset.n), left: r.left + r.width / 2 - host.left, top: r.top - host.top };
  }, []);

  const applyView = useCallback(
    (v: View) => {
      const next = clampView(v, frame.current);
      view.current = next;
      svgRef.current?.setAttribute("viewBox", `${next.x} ${next.y} ${next.w} ${next.h}`);
      scaleMarkers();
      setZoomed(next.w < frame.current.w * 0.98);
      if (pinnedEl.current) setTip(tipFor(pinnedEl.current));
    },
    [scaleMarkers, tipFor],
  );

  const animateTo = useCallback(
    (target: View) => {
      cancelAnimationFrame(anim.current);
      const from = { ...view.current };
      const to = clampView(target, frame.current);
      const t0 = performance.now();
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const step = (t: number) => {
        const k = reduce ? 1 : Math.min(1, (t - t0) / 380);
        const e = 1 - Math.pow(1 - k, 3);
        applyView({
          x: from.x + (to.x - from.x) * e,
          y: from.y + (to.y - from.y) * e,
          w: from.w + (to.w - from.w) * e,
          h: from.h + (to.h - from.h) * e,
        });
        if (k < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [applyView],
  );

  const zoomAt = useCallback(
    (factor: number, p: { x: number; y: number }, animate = false) => {
      const v = view.current;
      const next = { x: p.x - (p.x - v.x) / factor, y: p.y - (p.y - v.y) / factor, w: v.w / factor, h: v.h / factor };
      animate ? animateTo(next) : applyView(next);
    },
    [animateTo, applyView],
  );

  const centre = () => ({ x: view.current.x + view.current.w / 2, y: view.current.y + view.current.h / 2 });

  // A new tilt changes the whole frame: start again from the fitted plan.
  useEffect(() => {
    cancelAnimationFrame(anim.current);
    applyView({ ...tilt.frame });
  }, [tilt, applyView]);

  // Keep markers sized when the stage appears (e.g. an accordion opens) or resizes.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const ro = new ResizeObserver(() => {
      scaleMarkers();
      if (pinnedEl.current) setTip(tipFor(pinnedEl.current));
    });
    ro.observe(stage);
    return () => ro.disconnect();
  }, [scaleMarkers, tipFor, plan]);

  useEffect(scaleMarkers, [design.size, scaleMarkers]);

  /* --- gestures --- */

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return;

    const toUser = (x: number, y: number) => {
      const p = new DOMPoint(x, y).matrixTransform(svg.getScreenCTM()!.inverse());
      return { x: p.x, y: p.y };
    };

    let hintTimer = 0;
    const onWheel = (e: WheelEvent) => {
      if (cooperative && !e.ctrlKey && !e.metaKey) {
        setWheelHint(true);
        clearTimeout(hintTimer);
        hintTimer = window.setTimeout(() => setWheelHint(false), 1400);
        return;
      }
      e.preventDefault();
      setWheelHint(false);
      cancelAnimationFrame(anim.current);
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * (e.ctrlKey ? 0.01 : 0.0022)), toUser(e.clientX, e.clientY));
    };

    const pointers = new Map<number, { x: number; y: number }>();
    let pinchDist = 0;

    const onDown = (e: PointerEvent) => {
      cancelAnimationFrame(anim.current);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      moved.current = 0;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
      }
    };

    const onMove = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId);
      if (!prev) return;
      const scale = svg.getScreenCTM()!.a;
      if (pointers.size === 1) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        moved.current += Math.abs(dx) + Math.abs(dy);
        if (moved.current > 4) {
          if (!svg.hasPointerCapture(e.pointerId)) svg.setPointerCapture(e.pointerId);
          svg.classList.add("is-dragging");
        }
        const v = view.current;
        applyView({ ...v, x: v.x - dx / scale, y: v.y - dy / scale });
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        moved.current += 10;
        if (pinchDist) zoomAt(dist / pinchDist, toUser((a.x + b.x) / 2, (a.y + b.y) / 2));
        pinchDist = dist;
      }
    };

    const onUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      pinchDist = 0;
      if (!pointers.size) svg.classList.remove("is-dragging");
    };

    const onDbl = (e: MouseEvent) => {
      if ((e.target as Element).closest(".vp-marker")) return;
      zoomAt(e.shiftKey ? 0.5 : 2, toUser(e.clientX, e.clientY), true);
    };

    svg.addEventListener("wheel", onWheel, { passive: false });
    svg.addEventListener("pointerdown", onDown);
    svg.addEventListener("pointermove", onMove);
    svg.addEventListener("pointerup", onUp);
    svg.addEventListener("pointercancel", onUp);
    svg.addEventListener("dblclick", onDbl);
    return () => {
      clearTimeout(hintTimer);
      svg.removeEventListener("wheel", onWheel);
      svg.removeEventListener("pointerdown", onDown);
      svg.removeEventListener("pointermove", onMove);
      svg.removeEventListener("pointerup", onUp);
      svg.removeEventListener("pointercancel", onUp);
      svg.removeEventListener("dblclick", onDbl);
    };
  }, [interactive, cooperative, applyView, zoomAt]);

  /* --- highlighting --- */

  const showTip = (el: SVGGElement) => setTip(tipFor(el));
  const restoreTip = () => setTip(pinnedEl.current ? tipFor(pinnedEl.current) : null);

  // Centre the plan on a point, zooming in to at least `zoom`× (never zooming back out).
  const focusPoint = (p: { x: number; y: number }, zoom = 3.2) => {
    const F = frame.current;
    const w = Math.min(view.current.w, F.w / zoom);
    const h = (w * F.h) / F.w;
    animateTo({ x: p.x - w / 2, y: p.y - h / 2, w, h });
  };

  const togglePin = (el: SVGGElement, p: { x: number; y: number }, touch = false) => {
    if (moved.current > 4) return;
    const n = Number(el.dataset.n);
    if (pinned === n && pinnedEl.current === el) {
      pinnedEl.current = null;
      setPinned(null);
      setTip(null);
    } else {
      pinnedEl.current = el;
      setPinned(n);
      setTip(tipFor(el));
      focusPoint(p);
      // On a phone the legend sits below the plan: scrolling to it would push the plan off screen.
      if (!touch)
        rootRef.current
          ?.querySelector(`.vp-legend [data-n="${n}"]`)
          ?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  };

  const clearPin = () => {
    pinnedEl.current = null;
    setPinned(null);
    setTip(null);
  };

  const focusMarkers = (ns: number[]) => {
    const pts = VENUE_MARKERS.filter((m) => ns.includes(m.n)).map(tilt.project);
    if (!pts.length) return;
    const pad = 70;
    const minX = Math.min(...pts.map((p) => p.x)) - pad;
    const maxX = Math.max(...pts.map((p) => p.x)) + pad;
    const minY = Math.min(...pts.map((p) => p.y)) - pad;
    const maxY = Math.max(...pts.map((p) => p.y)) + pad;
    const F = frame.current;
    const w = Math.max(maxX - minX, ((maxY - minY) * F.w) / F.h);
    const h = (w * F.h) / F.w;
    animateTo({ x: (minX + maxX) / 2 - w / 2, y: (minY + maxY) / 2 - h / 2, w, h });
    stageRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  };

  useEffect(() => {
    if (!interactive) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && clearPin();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [interactive]);

  /* --- render --- */

  const c = design.colors;
  const style = {
    ...Object.fromEntries(Object.entries(c).map(([k, v]) => [`--vp-${k}`, v])),
    // Legend badges sit on the navy page, so fall back to white for dark marker colours.
    "--vp-badge": luminance(c.marker) > 0.35 ? c.marker : "#ffffff",
    "--vp-hatch": `url(#${uid}-hatch)`,
  } as CSSProperties;

  const hotSet = new Set(hot ?? []);

  return (
    <div
      ref={rootRef}
      className={`vp vp--${size} ${className}`}
      style={style}
      data-walls={design.walls}
      data-grid={design.grid ? "on" : "off"}
      data-hot={hot ? "" : undefined}
    >
      <div
        ref={stageRef}
        className="vp-stage"
        data-zoomed={zoomed ? "" : undefined}
        data-cooperative={cooperative ? "" : undefined}
      >
        <svg
          ref={svgRef}
          className="vp-svg"
          viewBox={`${tilt.frame.x} ${tilt.frame.y} ${tilt.frame.w} ${tilt.frame.h}`}
          role="img"
          aria-label="Floor plan of the Kultur & Kongresshaus Aarau with numbered areas"
          onClick={(e) => {
            if (moved.current > 4 || (e.target as Element).closest(".vp-marker")) return;
            clearPin();
          }}
        >
          <defs>
            <pattern id={`${uid}-grid-minor`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M10 0H0V10" className="vp-grid-line" />
            </pattern>
            <pattern id={`${uid}-grid`} width="50" height="50" patternUnits="userSpaceOnUse">
              <rect width="50" height="50" fill={`url(#${uid}-grid-minor)`} />
              <path d="M50 0H0V50" className="vp-grid-line vp-grid-major" />
            </pattern>
            {/* Diagonals drawn straight into the tile, corners included so they join across tiles. Safari
                paints a rotated tile with a semi-transparent hairline on its edge as dark patches. */}
            <pattern id={`${uid}-hatch`} width="4.5" height="4.5" patternUnits="userSpaceOnUse">
              <rect width="4.5" height="4.5" className="vp-hatch-bg" />
              <path d="M-1 1L1 -1M0 4.5L4.5 0M3.5 5.5L5.5 3.5" className="vp-hatch-line" />
            </pattern>
            {plan && <g id={`${uid}-walls`} className="vp-plan" dangerouslySetInnerHTML={{ __html: plan.walls }} />}
          </defs>
          <g transform={tilt.matrix}>
            <rect className="vp-grid-rect" x="-2000" y="-2000" width="5200" height="4800" fill={`url(#${uid}-grid)`} />
            {plan && <g className="vp-plan" dangerouslySetInnerHTML={{ __html: plan.drawing }} />}
          </g>
          {plan && tilt.lift > 0 && (
            <g className="vp-walls" aria-hidden>
              {Array.from({ length: WALL_LAYERS }, (_, i) => (
                <use
                  key={i}
                  href={`#${uid}-walls`}
                  className={i === WALL_LAYERS - 1 ? "vp-wall-top" : "vp-wall-side"}
                  transform={`translate(0 ${(-tilt.lift * (i + 1)) / WALL_LAYERS}) ${tilt.matrix}`}
                />
              ))}
            </g>
          )}
          {plan && (
            <g className="vp-markers">
              {VENUE_MARKERS.map((m, i) => {
                const p = tilt.project(m);
                const s = sectionOf.get(m.n)!;
                const up = upstairs.has(m.n);
                const Icon = iconOf.has(m.n) ? ICONS[iconOf.get(m.n)!] : null;
                return (
                  <g
                    key={i}
                    className={`vp-marker ${up ? "vp-marker--stairs" : ""} ${hotSet.has(m.n) ? "is-hot" : ""}`}
                    data-n={m.n}
                    transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`}
                    {...(interactive
                      ? {
                          tabIndex: 0,
                          role: "button",
                          "aria-label": `${Icon ? "" : `${m.n}: `}${labelOf.get(m.n)}${labelOf.get(m.n) === s.title ? "" : ` (${s.title})`}${up ? ", upstairs" : ""}`,
                          onPointerEnter: (e: ReactPointerEvent<SVGGElement>) => {
                            if (e.pointerType === "touch") return;
                            setHover([m.n]);
                            showTip(e.currentTarget);
                          },
                          onPointerLeave: () => {
                            setHover(null);
                            restoreTip();
                          },
                          onFocus: (e: FocusEvent<SVGGElement>) => {
                            setHover([m.n]);
                            showTip(e.currentTarget);
                          },
                          onBlur: () => {
                            setHover(null);
                            restoreTip();
                          },
                          onPointerDown: (e: ReactPointerEvent<SVGGElement>) => {
                            lastPointer.current = e.pointerType;
                          },
                          onClick: (e: ReactMouseEvent<SVGGElement>) =>
                            togglePin(e.currentTarget, p, lastPointer.current === "touch"),
                          onKeyDown: (e: ReactKeyboardEvent<SVGGElement>) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              moved.current = 0;
                              togglePin(e.currentTarget, p);
                            }
                          },
                        }
                      : { "aria-hidden": true })}
                  >
                    <g className="vp-marker-scale">
                      {up ? (
                        <>
                          <rect className="vp-marker-halo" x="-22.5" y="-15" width="45" height="30" rx="15" />
                          <rect className="vp-marker-dot" x="-17.5" y="-10.5" width="35" height="21" rx="10.5" />
                          <text className="vp-marker-num" x="-7" textAnchor="middle" dy="0.36em">
                            {m.n}
                          </text>
                          <g className="vp-marker-icon" transform="translate(1.2 -5.6) scale(0.8)">
                            <StairsGlyph />
                          </g>
                        </>
                      ) : Icon ? (
                        <>
                          <circle className="vp-marker-halo" r="15" />
                          <circle className="vp-marker-dot" r="10.5" />
                          <Icon className="vp-marker-glyph" x={-6.5} y={-6.5} width={13} height={13} strokeWidth={2.2} />
                        </>
                      ) : (
                        <>
                          <circle className="vp-marker-halo" r="15" />
                          <circle className="vp-marker-dot" r="10.5" />
                          <text className="vp-marker-num" textAnchor="middle" dy="0.36em">
                            {m.n}
                          </text>
                        </>
                      )}
                    </g>
                  </g>
                );
              })}
            </g>
          )}
        </svg>

        {!plan && <div className="vp-loading" aria-hidden />}

        {tip && (
          <div ref={tipRef} className="vp-tip" style={{ left: tip.left, top: tip.top }}>
            {!iconOf.has(tip.n) && <b>{tip.n}</b>} {labelOf.get(tip.n)}
            <TipContext n={tip.n} />
          </div>
        )}

        {interactive && (
          <>
            <div className="vp-zoom" role="group" aria-label="Zoom">
              <button type="button" aria-label="Zoom in" onClick={() => zoomAt(1.6, centre(), true)}>
                <Plus aria-hidden />
              </button>
              <button type="button" aria-label="Zoom out" onClick={() => zoomAt(1 / 1.6, centre(), true)}>
                <Minus aria-hidden />
              </button>
              <button type="button" aria-label="Fit plan" onClick={() => animateTo({ ...frame.current })}>
                <Maximize2 aria-hidden />
              </button>
            </div>
            {cooperative && (
              <p className={`vp-wheel-hint ${wheelHint ? "is-on" : ""}`} aria-hidden>
                Hold Ctrl or ⌘ and scroll to zoom
              </p>
            )}
          </>
        )}

        {expandable && (
          <button type="button" className="vp-expand" onClick={() => setExpanded(true)}>
            <Expand aria-hidden />
            Full screen
          </button>
        )}

        {showDesign && <DesignPanel design={design} setDesign={setDesign} />}
      </div>

      {legend && (
        <div className="vp-legend-wrap">
          <section className="vp-legend" aria-label="Legend">
            {VENUE_LEGEND.map((column) => (
              <div
                key={column[0].id}
                className={`vp-card ${column.some((s) => s.items.some((i) => hotSet.has(i.n))) ? "has-hot" : ""}`}
              >
                {column.map((s) => {
                  const ns = s.items.map((i) => i.n);
                  // An unlabelled item is the section itself: its badge goes in the heading.
                  const lead = s.items.find((i) => !i.label);
                  const rows = s.items.filter((i) => i.label);
                  return (
                    <article key={s.id} className="vp-group">
                      <h3
                        tabIndex={0}
                        data-n={lead?.n}
                        className={lead && hotSet.has(lead.n) ? "is-hot" : ""}
                        onPointerEnter={() => setHover(ns)}
                        onPointerLeave={() => setHover(null)}
                        onFocus={() => setHover(ns)}
                        onBlur={() => setHover(null)}
                        onClick={() => focusMarkers(ns)}
                        onKeyDown={(e) => e.key === "Enter" && focusMarkers(ns)}
                      >
                        {lead && <Badge item={lead} />}
                        <span>{s.title}</span>
                      </h3>
                      {rows.length > 0 && (
                        <ul>
                          {rows.map((i) => (
                            <li
                              key={i.n}
                              data-n={i.n}
                              tabIndex={0}
                              className={hotSet.has(i.n) ? "is-hot" : ""}
                              onPointerEnter={() => setHover([i.n])}
                              onPointerLeave={() => setHover(null)}
                              onFocus={() => setHover([i.n])}
                              onBlur={() => setHover(null)}
                              onClick={() => focusMarkers([i.n])}
                              onKeyDown={(e) => e.key === "Enter" && focusMarkers([i.n])}
                            >
                              <Badge item={i} />
                              <span>
                                {i.label}
                                {i.note && <small className="vp-note">{i.note}</small>}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </article>
                  );
                })}
              </div>
            ))}
          </section>
        </div>
      )}

      {expandable && <VenuePlanModal open={expanded} onClose={() => setExpanded(false)} />}
    </div>
  );
}

/** Section name (skipped when it only repeats the label) and an upstairs hint, under the tooltip label. */
function TipContext({ n }: { n: number }) {
  const title = sectionOf.get(n)?.title ?? "";
  const repeats = title.toLowerCase() === (labelOf.get(n) ?? "").toLowerCase();
  const parts = [repeats ? "" : title, upstairs.has(n) ? "Upstairs" : ""].filter(Boolean);
  return parts.length ? <small>{parts.join(" · ")}</small> : null;
}

/* ---------- design panel ---------- */

function DesignPanel({ design, setDesign }: { design: Design; setDesign: (d: Design) => void }) {
  const set = (patch: Partial<Design>) => setDesign({ ...design, ...patch });
  return (
    <details className="vp-knobs">
      <summary>Design</summary>
      <div className="vp-knobs-body">
        <fieldset>
          <legend>Palette</legend>
          <div className="vp-presets">
            {Object.entries(VENUE_PALETTES).map(([key, p]) => (
              <button
                key={key}
                type="button"
                aria-pressed={design.preset === key}
                onClick={() => set({ preset: key, colors: { ...p.colors } })}
              >
                <span className="vp-swatches">
                  <i style={{ background: p.colors.paper }} />
                  <i style={{ background: p.colors.ink }} />
                  <i style={{ background: p.colors.furniture }} />
                </span>
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="vp-colors">
          <legend>Colours</legend>
          {VENUE_COLOR_KNOBS.map(([key, label]) => (
            <label key={key}>
              <input
                type="color"
                value={design.colors[key]}
                onChange={(e) => set({ preset: "custom", colors: { ...design.colors, [key]: e.target.value } })}
              />
              {label}
            </label>
          ))}
        </fieldset>
        <fieldset>
          <legend>Walls</legend>
          <div className="vp-seg">
            {(["hatched", "solid", "outline"] as const).map((v) => (
              <button key={v} type="button" aria-pressed={design.walls === v} onClick={() => set({ walls: v })}>
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>Markers</legend>
          <label className="vp-range">
            Size
            <input
              type="range"
              min="0.6"
              max="1.8"
              step="0.05"
              value={design.size}
              onChange={(e) => set({ size: Number(e.target.value) })}
            />
          </label>
        </fieldset>
        <fieldset>
          <legend>3D</legend>
          <label className="vp-range">
            Tilt
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={design.tilt}
              onChange={(e) => set({ tilt: Number(e.target.value) })}
            />
          </label>
          <label className="vp-range">
            Wall height
            <input
              type="range"
              min="0"
              max="2.5"
              step="0.1"
              value={design.height}
              onChange={(e) => set({ height: Number(e.target.value) })}
            />
          </label>
        </fieldset>
        <label className="vp-check">
          <input type="checkbox" checked={design.grid} onChange={(e) => set({ grid: e.target.checked })} /> Blueprint grid
        </label>
        <button type="button" className="vp-resetdesign" onClick={() => setDesign(defaultDesign())}>
          Reset design
        </button>
      </div>
    </details>
  );
}

/* ---------- full-screen modal ---------- */

export function VenuePlanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.documentElement.style.overflow;
    const returnFocus = document.activeElement as HTMLElement | null;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      returnFocus?.focus();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="vp-modal" role="dialog" aria-modal="true" aria-labelledby="vp-modal-title">
      <header className="vp-modal__head">
        <div>
          <p className="section-eyebrow">Layout plan</p>
          <h2 id="vp-modal-title">Kultur &amp; Kongresshaus Aarau</h2>
        </div>
        <div className="vp-modal__actions">
          <a href={withBase("map")} className="vp-modal__link">
            Open page <ArrowUpRight aria-hidden />
          </a>
          <button ref={closeRef} type="button" className="vp-modal__close" onClick={onClose} aria-label="Close floor plan">
            <X aria-hidden />
          </button>
        </div>
      </header>
      <VenuePlan size="fill" legend className="vp-modal__plan" />
    </div>,
    document.body,
  );
}

/* ---------- compact card that opens the modal ---------- */

export function VenuePlanCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="vp-card-button" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <VenuePlan size="thumb" />
        <span className="vp-card-button__text">
          <span>
            <span className="vp-card-button__title">Venue floor plan</span>
            <span className="vp-card-button__sub">Stages, lounges, catering, posters and art</span>
          </span>
          <Expand aria-hidden />
        </span>
      </button>
      <VenuePlanModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
