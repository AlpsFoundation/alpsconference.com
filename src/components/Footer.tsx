import { useEffect, useRef, useState } from "react";
import { Heart } from "lucide-react";
import { withBase } from "../lib/withBase";
import SynapseIllustration from "./SynapseIllustration";

// "synapse": the 3D synapse (the home page's former hero illustration), at a
// quarter of its hero size. "image": the static bones.png (/static).
export type FooterIllustration = "image" | "synapse";

// Start loading three.js this far before the footer scrolls into view.
const LOAD_MARGIN = "600px 0px";

// Framed to its own small canvas: nearly as wide as it (no enlargement on
// narrow canvases), smaller specks, and no floaters crossing the edges.
const SYNAPSE_OPTIONS = {
  maxWidth: (w: number) => w * 0.94,
  particleScale: 0.9,
  floaters: false,
};

function FooterSynapse({ illustration }: { illustration: FooterIllustration }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = illustration === "image" || failed;

  useEffect(() => {
    const box = boxRef.current;
    if (!box || showImage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: LOAD_MARGIN }
    );
    observer.observe(box);
    return () => observer.disconnect();
  }, [showImage]);

  return (
    <div ref={boxRef} className="footer-synapse" aria-hidden="true">
      {showImage ? (
        <img src={withBase("img/bones.png")} alt="" className="footer-synapse__image" />
      ) : (
        near && (
          <SynapseIllustration
            interactionTarget={boxRef}
            options={SYNAPSE_OPTIONS}
            onUnsupported={() => setFailed(true)}
            className="footer-synapse__canvas"
          />
        )
      )}
    </div>
  );
}

export default function Footer({ illustration }: { illustration?: FooterIllustration }) {
  return (
    <footer className="relative border-t border-white/10 py-10">
      {/* No z-index here: the synapse screen-blends with the page behind the footer. */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div
          className={`flex flex-col items-center gap-6 ${
            illustration
              ? "md:grid md:grid-cols-[1fr_auto_1fr] md:gap-8"
              : "sm:flex-row sm:justify-between"
          }`}
        >
          <div className="flex items-center gap-4 md:justify-self-start">
            <img src={withBase("img/logo.png")} alt="ALPS" className="h-6 w-auto opacity-80" />
            <a
              href="https://www.alps.foundation/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-white/90 font-medium hover:text-white transition-colors"
            >
              &copy; 2026 ALPS Foundation
            </a>
          </div>

          {illustration && <FooterSynapse illustration={illustration} />}

          <div className="flex items-center gap-1.5 text-base text-white/80 font-medium md:justify-self-end">
            Made with <Heart className="w-4 h-4 text-support-light mx-0.5" /> in Switzerland
          </div>
        </div>
      </div>
    </footer>
  );
}
