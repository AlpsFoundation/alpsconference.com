import { useState, useEffect, useCallback } from "react";
import { withBase } from "../lib/withBase";

const IMAGES = [
  { src: "gallery/1.JPG", alt: "ALPS Conference – previous edition" },
  { src: "gallery/2.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/3.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/4.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/5.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/6.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/7.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/8.jpg", alt: "ALPS Conference – previous edition" },
  { src: "gallery/9.png", alt: "ALPS Conference – previous edition" },
];

export default function Gallery() {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + IMAGES.length) % IMAGES.length),
    []
  );
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % IMAGES.length),
    []
  );

  // Auto-advance every 4 s when lightbox is closed
  useEffect(() => {
    if (lightbox !== null) return;
    const id = setInterval(next, 4000);
    return () => clearInterval(id);
  }, [next, lightbox]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") lightbox !== null ? setLightbox((l) => (l! - 1 + IMAGES.length) % IMAGES.length) : prev();
      if (e.key === "ArrowRight") lightbox !== null ? setLightbox((l) => (l! + 1) % IMAGES.length) : next();
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, lightbox]);

  // Visible slide indices: prev, current, next
  const indices = [
    (current - 1 + IMAGES.length) % IMAGES.length,
    current,
    (current + 1) % IMAGES.length,
  ];

  return (
    <section id="gallery" className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-2 text-neutral-light">
          Previous Editions
        </h2>
        <p className="text-center text-neutral-mid mb-12 text-sm tracking-widest uppercase">
          A glimpse of past conferences
        </p>

        {/* Carousel */}
        <div className="relative flex items-center justify-center gap-4">
          {/* Prev button */}
          <button
            onClick={prev}
            aria-label="Previous photo"
            className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 transition flex items-center justify-center text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>

          {/* Slides */}
          <div className="flex items-center gap-4 overflow-hidden w-full max-w-3xl">
            {indices.map((idx, pos) => {
              const isCenter = pos === 1;
              return (
                <div
                  key={idx}
                  onClick={() => isCenter && setLightbox(idx)}
                  className={`
                    relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-500
                    ${isCenter
                      ? "w-full aspect-video cursor-zoom-in shadow-2xl ring-2 ring-white/20"
                      : "hidden md:block w-40 aspect-video opacity-40 scale-95 cursor-pointer hover:opacity-60"
                    }
                  `}
                >
                  <img
                    src={withBase(IMAGES[idx].src)}
                    alt={IMAGES[idx].alt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {!isCenter && (
                    <div className="absolute inset-0 bg-primary/40" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Next button */}
          <button
            onClick={next}
            aria-label="Next photo"
            className="flex-shrink-0 w-10 h-10 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 transition flex items-center justify-center text-white"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? "bg-accent w-5" : "bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            ×
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l! - 1 + IMAGES.length) % IMAGES.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <img
            src={withBase(IMAGES[lightbox].src)}
            alt={IMAGES[lightbox].alt}
            className="max-w-full max-h-full rounded-xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => { e.stopPropagation(); setLightbox((l) => (l! + 1) % IMAGES.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
            aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="absolute bottom-4 text-white/50 text-sm">
            {lightbox + 1} / {IMAGES.length}
          </div>
        </div>
      )}
    </section>
  );
}
