import { useEffect, useRef, type RefObject } from "react";
import type { SynapseOptions } from "../scripts/synapse3d";

type Props = {
  onTitle?: () => void;
  onParticles?: () => void;
  // No WebGL, a low-end device, a slow connection or a low frame rate: the
  // caller shows bones.png instead.
  onUnsupported?: () => void;
  // Clicks and taps here flare the illustration (and ask for motion access on iOS).
  interactionTarget?: RefObject<HTMLElement | null>;
  className?: string;
  // Extra options for initSynapse (spin, framing), read once on mount.
  options?: Pick<SynapseOptions, "spin" | "zoom" | "shiftX" | "shiftY">;
  // Changing this draws the mesh in again (not its first value: the intro plays anyway).
  replayKey?: string;
};

// Give up on three.js if it hasn't loaded by then.
const LOAD_TIMEOUT_MS = 4000;

type NavigatorHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean; effectiveType?: string };
};

function isLowEnd() {
  const nav = navigator as NavigatorHints;
  if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return true;
  if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return true;
  return !!nav.deviceMemory && nav.deviceMemory <= 1;
}

// The 3D synapse (src/scripts/synapse3d.ts) as the hero illustration. three.js
// is loaded on demand, so pages without it don't pay for it. The canvas renders
// on black and is screen-blended over the hero, like the PNG it replaces.
export default function SynapseIllustration(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef(props);
  callbacks.current = props;
  const controls = useRef<{ replay(): void } | null>(null);
  const lastReplayKey = useRef(props.replayKey);

  useEffect(() => {
    if (props.replayKey === lastReplayKey.current) return;
    const first = lastReplayKey.current === undefined;
    lastReplayKey.current = props.replayKey;
    if (!first) controls.current?.replay();
  }, [props.replayKey]);

  useEffect(() => {
    const unsupported = () => callbacks.current.onUnsupported?.();
    if (isLowEnd()) {
      unsupported();
      return;
    }

    let dispose: (() => void) | undefined;
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      cancelled = true;
      unsupported();
    }, LOAD_TIMEOUT_MS);

    import("../scripts/synapse3d")
      .then(({ initSynapse }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        window.clearTimeout(timeout);
        dispose = initSynapse(canvas, {
          embedded: true,
          intro: true,
          floaters: true,
          particleScale: 1.8,
          ...callbacks.current.options,
          interactionTarget: callbacks.current.interactionTarget?.current ?? undefined,
          onTitle: () => callbacks.current.onTitle?.(),
          onParticles: () => callbacks.current.onParticles?.(),
          onUnsupported: unsupported,
          onSlow: unsupported,
          onReady: (c) => {
            controls.current = c;
          },
        });
      })
      .catch(() => {
        window.clearTimeout(timeout);
        if (!cancelled) unsupported();
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none mix-blend-screen ${props.className ?? ""}`}
      aria-hidden="true"
    />
  );
}
