import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { PARTNERS } from "../data/partners";

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
      id="partners"
      className="relative border-t border-white/10 py-14 sm:py-16 pb-16 sm:pb-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">
            Supported by
          </p>
          <h2 className="section-title">
            Our Amazing Partners
          </h2>
        </div>

        <div className="space-y-7 sm:space-y-8">
          {Object.entries(PARTNERS).map(([category, logos]) => (
            <div key={category} data-fade-up className="opacity-0">
              <h3 className="text-xs sm:text-sm font-medium tracking-[0.12em] uppercase text-white/45 text-center mb-3">
                {category}
              </h3>
              <ul
                className="flex flex-wrap justify-center items-center gap-x-0 gap-y-1 sm:gap-y-2 md:gap-y-3 list-none p-0 m-0"
                aria-label={category}
              >
                {logos.map((partner, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-center"
                  >
                    <a
                      href={partner.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={partner.src}
                        alt={partner.alt}
                        style={partner.scale != null ? { transform: `scale(${partner.scale})` } : undefined}
                        className="max-h-[6.75rem] sm:max-h-[7.5rem] md:max-h-[8.25rem] w-auto max-w-[min(100%,18rem)] sm:max-w-[20rem] object-contain object-center opacity-[0.88] hover:opacity-100 transition-opacity duration-200"
                        loading="lazy"
                        decoding="async"
                      />
                    </a>
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
