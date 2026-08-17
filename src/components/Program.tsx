import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

export default function Program() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: (_: unknown, i: number) => i * 120,
            duration: 800,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  return (
    <section ref={sectionRef} id="program" className="relative py-24 sm:py-32 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Friday–Saturday, October 9–10, 2026
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Scientific Program
          </h2>
        </div>

        <button
          type="button"
          data-fade-up
          onClick={() => setLightbox(true)}
          aria-label="Open scientific program in full screen"
          className="opacity-0 group block w-full rounded-sm border border-white/10 overflow-hidden cursor-zoom-in"
        >
          <img
            src={withBase("img/scientific-program.jpg")}
            alt="ALPS 2026 Scientific Program schedule for Friday and Saturday, October 9–10"
            className="w-full h-auto transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
        </button>

        <p data-fade-up className="opacity-0 mt-6 text-center text-white/50 text-sm">
          Tap the schedule to view it full screen. Speakers and timings subject to change.
        </p>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={withBase("img/scientific-program.jpg")}
            alt="ALPS 2026 Scientific Program schedule for Friday and Saturday, October 9–10"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Close full screen view"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightbox(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}
    </section>
  );
}
