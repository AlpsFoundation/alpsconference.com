import { useEffect, useRef } from "react";
import { animate } from "animejs";

const PARTNERS = {
  "Academic Partners": [
    "/img/partners/academic-01.png",
    "/img/partners/academic-02.png",
    "/img/partners/academic-03.png",
    "/img/partners/academic-04.png",
    "/img/partners/academic-05.png"
  ],
  "Swiss Professional Associations": [
    "/img/partners/associations-01.png",
    "/img/partners/associations-02.png",
    "/img/partners/associations-03.png",
    "/img/partners/associations-04.png",
    "/img/partners/associations-05.png"
  ],
  "Media Partners": [
    "/img/partners/media-01.png",
    "/img/partners/media-02.png",
    "/img/partners/media-03.png",
    "/img/partners/media-04.png",
    "/img/partners/media-05.png",
    "/img/partners/media-06.png",
    "/img/partners/media-07.png",
    "/img/partners/media-08.png"
  ]
};

export default function Partners() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [20, 0],
            delay: (_: unknown, i: number) => i * 50,
            duration: 600,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="sponsoring"
      className="relative border-t border-white/10 py-14 sm:py-16 pb-16 sm:pb-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="text-sm sm:text-base tracking-[0.2em] uppercase text-support-light font-medium mb-2">
            Supported by
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Our Amazing Partners
          </h2>
        </div>

        <div className="space-y-10 sm:space-y-12">
          {Object.entries(PARTNERS).map(([category, logos]) => (
            <div key={category} data-fade-up className="opacity-0">
              <h3 className="text-xs sm:text-sm font-medium tracking-[0.12em] uppercase text-white/45 text-center mb-4 sm:mb-5">
                {category}
              </h3>
              <ul
                className="flex flex-wrap justify-center items-center gap-x-6 gap-y-8 sm:gap-x-10 sm:gap-y-10 md:gap-x-12 md:gap-y-12 list-none p-0 m-0"
                aria-label={category}
              >
                {logos.map((logo, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3"
                  >
                    <img
                      src={logo}
                      alt={`${category}: logo ${idx + 1}`}
                      className="max-h-[6.75rem] sm:max-h-[7.5rem] md:max-h-[8.25rem] w-auto max-w-[min(100%,18rem)] sm:max-w-[20rem] object-contain object-center opacity-[0.88] hover:opacity-100 transition-opacity duration-200"
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}