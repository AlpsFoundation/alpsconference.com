import { useEffect, useRef, useState } from "react";
import type { NeoDiscoInstance, NeoDiscoOptions } from "neodisco";

const SPARKLE_COUNT = 10;

function viewportOptions(): NeoDiscoOptions {
  const styles = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) =>
    styles.getPropertyValue(`--color-${name}`).trim() || fallback;

  return {
    size: "auto",
    background: false,
    theme: "ice",
    palette: {
      base: color("neutral-dark", "#082f4a"),
      mirror: [
        color("primary", "#0B3C5D"),
        color("support", "#2E7CC7"),
        color("support-light", "#52a9ec"),
        color("secondary", "#C4CCD4"),
        color("neutral-light", "#eef4f8"),
        color("accent-light", "#f8acd0"),
        "#ffffff",
      ],
      glow: color("support-light", "#52a9ec"),
      wire: "rgba(210, 232, 248, 0.62)",
      shadow: "rgba(8, 47, 74, 0.65)",
    },
    radius: 0.42,
    tileRows: 22,
    tileColumns: 40,
    tileGap: 0.68,
    rotationSpeed: 0,
    contrast: 0.95,
    sparkle: 1,
    glow: 1,
    cord: true,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    seed: 2026,
    paused: true,
  };
}

function bindDiscoPointer(
  host: HTMLElement,
  reducedMotion: MediaQueryList,
  engagedRef: { current: boolean }
) {
  let destX = 0;
  let destY = 0;
  let curX = 0;
  let curY = 0;
  let held = false;
  let raf = 0;

  const apply = () => {
    host.style.setProperty("--disco-swing", `${curX * (held ? 16 : 11)}deg`);
    host.style.setProperty("--disco-nudge", `${curX * (held ? 18 : 10)}px`);
    host.style.setProperty("--disco-tilt", `${curY * (held ? 10 : 6)}px`);
    host.toggleAttribute("data-held", held);
  };

  const tick = () => {
    if (!engagedRef.current) {
      destX = 0;
      destY = 0;
    }
    const ease = held ? 0.2 : 0.075;
    curX += (destX - curX) * ease;
    curY += (destY - curY) * ease;
    apply();
    raf = requestAnimationFrame(tick);
  };

  const point = (clientX: number, clientY: number) => {
    const rect = host.getBoundingClientRect();
    destX = Math.max(-1.15, Math.min(1.15, (clientX - (rect.left + rect.width / 2)) / 220));
    destY = Math.max(-1, Math.min(1, (clientY - (rect.top + rect.height * 0.42)) / 260));
  };

  const onMove = (event: PointerEvent) => {
    if (reducedMotion.matches || !engagedRef.current) return;
    point(event.clientX, event.clientY);
  };

  const onDown = (event: PointerEvent) => {
    if (event.button !== 0 || reducedMotion.matches || !engagedRef.current) return;
    held = true;
    host.setPointerCapture(event.pointerId);
    point(event.clientX, event.clientY);
    event.stopPropagation();
  };

  const onUp = (event: PointerEvent) => {
    if (!held) return;
    held = false;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };

  const stopClick = (event: Event) => event.stopPropagation();

  host.addEventListener("pointermove", onMove);
  host.addEventListener("pointerdown", onDown);
  host.addEventListener("pointerup", onUp);
  host.addEventListener("pointercancel", onUp);
  host.addEventListener("click", stopClick);
  raf = requestAnimationFrame(tick);

  return () => {
    cancelAnimationFrame(raf);
    host.removeEventListener("pointermove", onMove);
    host.removeEventListener("pointerdown", onDown);
    host.removeEventListener("pointerup", onUp);
    host.removeEventListener("pointercancel", onUp);
    host.removeEventListener("click", stopClick);
    host.removeAttribute("data-held");
    host.style.removeProperty("--disco-swing");
    host.style.removeProperty("--disco-nudge");
    host.style.removeProperty("--disco-tilt");
  };
}

function AfterpartyDisco({ live }: { live: boolean }) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const instanceRef = useRef<NeoDiscoInstance>();
  const playingRef = useRef(false);
  const liveRef = useRef(live);
  const visibleRef = useRef(false);
  const engagedRef = useRef(false);
  const [engaged, setEngaged] = useState(false);
  liveRef.current = live;

  const setEngagedState = (value: boolean) => {
    if (engagedRef.current === value) return;
    engagedRef.current = value;
    setEngaged(value);
    instanceRef.current?.update({ rotationSpeed: value ? 0.14 : 0 });
  };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const syncPlayback = () => {
      const instance = instanceRef.current;
      if (!instance) return;
      const shouldPlay =
        visibleRef.current &&
        !document.hidden &&
        !reducedMotion.matches &&
        liveRef.current;
      if (shouldPlay === playingRef.current) return;
      playingRef.current = shouldPlay;
      if (shouldPlay) instance.play();
      else instance.pause();
    };

    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(host);
    document.addEventListener("visibilitychange", syncPlayback);
    reducedMotion.addEventListener("change", syncPlayback);

    void import("neodisco")
      .then(({ createNeoDisco }) => {
        if (disposed) return;
        instanceRef.current = createNeoDisco(host, viewportOptions());
        instanceRef.current.update({ rotationSpeed: engagedRef.current ? 0.14 : 0 });
        syncPlayback();
      })
      .catch((error) => {
        if (!disposed) console.error("Unable to load the afterparty decoration", error);
      });

    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      reducedMotion.removeEventListener("change", syncPlayback);
      instanceRef.current?.destroy();
      instanceRef.current = undefined;
      playingRef.current = false;
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shouldPlay =
      visibleRef.current &&
      !document.hidden &&
      !reducedMotion &&
      live;
    if (shouldPlay === playingRef.current) return;
    playingRef.current = shouldPlay;
    if (shouldPlay) instance.play();
    else instance.pause();
  }, [live]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !live) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const unbindPointer = bindDiscoPointer(host, reducedMotion, engagedRef);

    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      setEngagedState(true);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      setEngagedState(false);
    };
    const onDown = (event: PointerEvent) => {
      event.stopPropagation();
      if (event.pointerType === "touch") setEngagedState(true);
    };
    const onOutside = (event: PointerEvent) => {
      if (event.pointerType !== "touch") return;
      if (!host.contains(event.target as Node)) setEngagedState(false);
    };

    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerdown", onOutside);

    return () => {
      unbindPointer();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerdown", onOutside);
      setEngagedState(false);
    };
  }, [live]);

  return (
    <span
      ref={hostRef}
      className="afterparty-disco afterparty-disco--viewport"
      data-spinning={engaged}
      data-engaged={engaged}
      aria-hidden="true"
    >
      <span className="afterparty-disco__sparkles">
        {Array.from({ length: SPARKLE_COUNT }, (_, index) => (
          <i key={index} />
        ))}
      </span>
    </span>
  );
}

export default function AfterpartyDiscoScene({ active }: { active: boolean }) {
  return (
    <div className="afterparty-disco-scene" data-active={active} aria-hidden="true">
      <AfterpartyDisco live={active} />
    </div>
  );
}
