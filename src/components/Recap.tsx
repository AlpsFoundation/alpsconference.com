import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import { RECAP_PHOTOS } from "../data/recap2026";

const linkClass = "text-support-light hover:text-white transition-colors underline underline-offset-4";

// "This was ALPS 2026": a short look back with the sponsors and the decoration partner named in the text
// (Greenfinity asked for an in-text mention with a link), and a swipeable photo strip. Photos keep their
// own shape at one height, so portrait and landscape shots sit side by side without cropping.
export default function Recap() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const hasAnimated = useRef(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      setAtStart(track.scrollLeft <= 4);
      setAtEnd(track.scrollLeft + track.clientWidth >= track.scrollWidth - 4);
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scrollByPage = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section ref={sectionRef} id="recap" className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">Recap</p>
          <h2 className="section-title">This was ALPS 2026</h2>
        </div>

        <div className="space-y-4 text-base sm:text-[1.05rem] text-white/78 leading-relaxed">
          <p data-fade-up className="opacity-0">
            For two days in October, the Kultur &amp; Kongresshaus Aarau belonged to psychedelic science. Researchers,
            clinicians, students and curious minds came together for talks and panels on the latest evidence, research
            posters, a first Workshop Day, art, sound and movement experiences, and many good conversations between the
            sessions.
          </p>
          <p data-fade-up className="opacity-0">
            None of it would have been possible without our partners. Our sponsors, the{" "}
            <a href="https://fondationcsm.org/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              Fondation Conscience et Santé Mentale
            </a>{" "}
            and the{" "}
            <a href="https://www.aarau.ch/" target="_blank" rel="noopener noreferrer" className={linkClass}>
              City of Aarau
            </a>
            , made the conference possible. Our decoration partner{" "}
            <a href="https://www.greenfinity.ch/" target="_blank" rel="noopener" className={linkClass}>
              Greenfinity
            </a>{" "}
            brought the venue to life with its moss panels and the ALPS moss letters.
          </p>
          <p data-fade-up className="opacity-0">
            A warm thank you to all our <a href="#partners" className={linkClass}>academic, professional and media partners</a>,
            and to every supporter, speaker, volunteer and attendee who made ALPS 2026 what it was.
          </p>
        </div>
      </div>

      <div data-fade-up className="opacity-0 relative mt-12 sm:mt-14">
        <ul
          ref={trackRef}
          className="recap-track flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory list-none m-0 py-1 px-4 sm:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          aria-label="Photos from ALPS Conference 2026"
        >
          {RECAP_PHOTOS.map((photo) => (
            <li key={photo.src} className="snap-center shrink-0">
              <figure className="m-0">
                <img
                  src={withBase(`img/recap-2026/${photo.src}`)}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt}
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block h-[22rem] sm:h-[28rem] w-auto max-w-[85vw] object-cover rounded-[1rem] border border-white/10"
                />
                <figcaption
                  className="mt-2.5 text-sm text-white/55 leading-snug"
                  style={{ width: 0, minWidth: "100%" }}
                >
                  {photo.caption}
                  {photo.greenfinity && (
                    <>
                      , by our decoration partner{" "}
                      <a href="https://www.greenfinity.ch/" target="_blank" rel="noopener" className={linkClass}>
                        Greenfinity
                      </a>
                    </>
                  )}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 flex items-center justify-between gap-4">
          <p className="text-xs sm:text-sm text-white/45">
            Photos:{" "}
            <a href="https://www.maxluedi.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline underline-offset-4">
              Max Lüdicke
            </a>{" "}
            and the ALPS team
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              aria-label="Previous photos"
              onClick={() => scrollByPage(-1)}
              disabled={atStart}
              className="p-2 sm:p-3 rounded-full bg-primary/80 hover:bg-primary border border-white/10 text-white transition-opacity disabled:opacity-35 disabled:cursor-default"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button
              type="button"
              aria-label="Next photos"
              onClick={() => scrollByPage(1)}
              disabled={atEnd}
              className="p-2 sm:p-3 rounded-full bg-primary/80 hover:bg-primary border border-white/10 text-white transition-opacity disabled:opacity-35 disabled:cursor-default"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
