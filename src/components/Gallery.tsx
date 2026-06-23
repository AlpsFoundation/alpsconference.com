import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

const images = [
  { src: "1.webp" },
  { src: "2.webp" },
  { src: "3.webp" },
  { src: "4.webp" },
  { src: "5.webp" },
  { src: "6.webp" },
  { src: "7.webp" },
  { src: "8.webp" },
  { src: "9.webp" },
  { src: "10.webp" },
  { src: "11.webp" },
  { src: "12.webp" },
  { src: "13.webp" },
  { src: "14.webp" },
  { src: "15.webp" },
  { src: "16.webp" },
  { src: "17.webp" },
  { src: "18.webp" },
];

export default function Gallery() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [24, 0],
            delay: (_: unknown, i: number) => i * 100,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 4000);
  };

  useEffect(() => {
    startAuto();
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, []);

  const goTo = (idx: number) => {
    setCurrent((idx + images.length) % images.length);
    startAuto();
  };

  // Drag/swipe
  const dragStart = useRef<number | null>(null);
  const onPointerDown = (e: React.PointerEvent) => { dragStart.current = e.clientX; };
  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - e.clientX;
    if (Math.abs(delta) > 40) goTo(current + (delta > 0 ? 1 : -1));
    dragStart.current = null;
  };

  // Keyboard nav in lightbox
  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setLightbox((l) => ((l ?? 0) + 1) % images.length);
      if (e.key === "ArrowLeft") setLightbox((l) => ((l ?? 0) - 1 + images.length) % images.length);
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox]);

  const visibleIndices = [-2, -1, 0, 1, 2].map(
    (offset) => (current + offset + images.length) % images.length
  );

  return (
    <section ref={sectionRef} id="gallery" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <h2 className="text-3xl font-semibold text-white">
            Highlights from Previous Conferences
          </h2>
        </div>

        {/* Carousel */}
        <div
          data-fade-up
          className="opacity-0 relative select-none touch-pan-y"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          {/* Track */}
          <div ref={trackRef} className="relative flex items-center justify-center h-[340px] sm:h-[460px] overflow-hidden">
            {images.map((img, idx) => {
              const pos = visibleIndices.indexOf(idx);
              if (pos === -1) return null;
              const offset = pos - 2; // -2..2
              const isCenter = offset === 0;
              const absOffset = Math.abs(offset);
              const tx = offset * (isCenter ? 0 : 260);
              const scale = isCenter ? 1 : 1 - absOffset * 0.12;
              const opacity = isCenter ? 1 : 1 - absOffset * 0.3;
              const zIndex = 10 - absOffset * 3;

              return (
                <div
                  key={idx}
                  className="absolute cursor-pointer rounded-sm overflow-hidden"
                  style={{
                    transform: `translateX(${tx}px) scale(${scale})`,
                    opacity,
                    zIndex,
                    transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.5s ease",
                    width: isCenter ? "min(560px, 90vw)" : "min(400px, 65vw)",
                    aspectRatio: "3/2",
                  }}
                  onClick={() => isCenter ? setLightbox(idx) : goTo(idx)}
                >
                  <img
                    src={withBase(`gallery/${img.src}`)}
                    alt={`ALPS Conference gallery photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                  />
                  {isCenter && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Prev / Next */}
          <button
            aria-label="Previous photo"
            onClick={() => goTo(current - 1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-primary/80 hover:bg-primary border border-white/10 text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            aria-label="Next photo"
            onClick={() => goTo(current + 1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 rounded-full bg-primary/80 hover:bg-primary border border-white/10 text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Dots */}
        <div data-fade-up className="opacity-0 flex justify-center gap-2 mt-6">
          {images.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to photo ${idx + 1}`}
              onClick={() => goTo(idx)}
              className={`rounded-full transition-all duration-300 ${
                idx === current
                  ? "w-6 h-2 bg-support-light"
                  : "w-2 h-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <img
            src={withBase(`gallery/${images[lightbox].src}`)}
            alt={`ALPS Conference gallery photo ${lightbox + 1}`}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button
            aria-label="Close lightbox"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            onClick={() => setLightbox(null)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div className="absolute bottom-4 text-white/50 text-sm">
            {lightbox + 1} / {images.length} — press ← → to navigate, Esc to close
          </div>
        </div>
      )}
    </section>
  );
}
