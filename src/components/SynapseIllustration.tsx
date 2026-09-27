import { useEffect, useRef } from "react";

type Props = {
  onTitle?: () => void;
  onParticles?: () => void;
  onUnsupported?: () => void;
};

// The 3D synapse (src/scripts/synapse3d.ts) as the hero illustration. three.js
// is loaded on demand, so pages without it don't pay for it. The canvas renders
// on black and is screen-blended over the hero, like the PNG it replaces.
export default function SynapseIllustration(props: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacks = useRef(props);
  callbacks.current = props;

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("../scripts/synapse3d")
      .then(({ initSynapse }) => {
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        dispose = initSynapse(canvas, {
          embedded: true,
          intro: true,
          floaters: true,
          particleScale: 1.8,
          onTitle: () => callbacks.current.onTitle?.(),
          onParticles: () => callbacks.current.onParticles?.(),
          onUnsupported: () => callbacks.current.onUnsupported?.(),
        });
      })
      .catch(() => callbacks.current.onUnsupported?.());
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
      aria-hidden="true"
    />
  );
}
