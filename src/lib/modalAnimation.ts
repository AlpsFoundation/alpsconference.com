import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";

type ModalMotionOptions = {
  overlayDuration?: number;
  panelDuration?: number;
  exitOverlayDuration?: number;
  exitPanelDuration?: number;
  translateY?: number;
  scale?: number;
};

type ModalMotion = ModalMotionOptions & {
  overlay: HTMLElement;
  panel: HTMLElement;
};

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function animateModalEnter({
  overlay,
  panel,
  overlayDuration = 220,
  panelDuration = 440,
  translateY = 18,
  scale = 0.97,
}: ModalMotion) {
  if (prefersReducedMotion()) {
    overlay.style.opacity = "1";
    panel.style.opacity = "1";
    return;
  }

  animate(overlay, { opacity: [0, 1], duration: overlayDuration, ease: "linear" });
  animate(panel, {
    opacity: [0, 1],
    translateY: [translateY, 0],
    scale: [scale, 1],
    duration: panelDuration,
    ease: "outCubic",
  });
}

export function animateModalExit({
  overlay,
  panel,
  exitOverlayDuration = 180,
  exitPanelDuration = 280,
  translateY = 14,
  scale = 0.985,
}: ModalMotion) {
  if (prefersReducedMotion()) {
    overlay.style.opacity = "0";
    panel.style.opacity = "0";
    return Promise.resolve();
  }

  animate(overlay, { opacity: 0, duration: exitOverlayDuration, ease: "linear" });
  return animate(panel, {
    opacity: 0,
    translateY,
    scale,
    duration: exitPanelDuration,
    ease: "inCubic",
  }).then(() => undefined);
}

export function useModalPresence(open: boolean) {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (open) setHeld(true);
  }, [open]);

  return {
    present: open || held,
    onExited: () => setHeld(false),
  };
}

export function useModalMotion(
  open: boolean,
  overlayRef: { current: HTMLElement | null },
  panelRef: { current: HTMLElement | null },
  onExited: () => void,
  options?: ModalMotionOptions
) {
  const onExitedRef = useRef(onExited);
  const optionsRef = useRef(options);
  onExitedRef.current = onExited;
  optionsRef.current = options;

  useEffect(() => {
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const motion = { overlay, panel, ...optionsRef.current };

    if (open) {
      animateModalEnter(motion);
      return;
    }

    let cancelled = false;
    void animateModalExit(motion).then(() => {
      if (!cancelled) onExitedRef.current();
    });

    return () => {
      cancelled = true;
    };
  }, [open, overlayRef, panelRef]);
}
