import { useEffect, useRef } from "react";
import { animate } from "animejs";

const PARTNERS = {
  "Academic Partners": [
    { src: "/img/partners/hug.png", alt: "Hôpitaux Universitaires de Genève (HUG)", url: "https://www.hug.ch/" },
    { src: "/img/partners/unige.png", alt: "Université de Genève (UNIGE)", url: "https://www.unige.ch/" },
    { src: "/img/partners/unibas.png", alt: "University of Basel (Uni Basel)", url: "https://www.unibas.ch/" },
    { src: "/img/partners/unifr.png", alt: "Université de Fribourg (Uni FR)", url: "https://www.unifr.ch/" },
    { src: "/img/partners/uzh.png", alt: "Universität Zürich (UZH)", url: "https://www.uzh.ch/" }
  ],
  "Swiss Professional Associations": [
    { src: "/img/partners/aspt.png", alt: "Psychédéliques en thérapie (ASPT)", url: "https://www.aspt-association.ch/" },
    { src: "/img/partners/fondazione-alaya.png", alt: "Fondazione Alaya", url: "https://www.fondazionealaya.ch/" },
    { src: "/img/partners/psychedelos.png", alt: "Association Psychédelos", url: "https://psychedelos.ch/" },
    { src: "/img/partners/saept.png", alt: "SÄPT (Schweizerische Ärztegesellschaft für Psycholytische Therapie)", url: "https://saept.ch/" },
    { src: "/img/partners/sspm.png", alt: "Swiss Society for Psychedelic Medicine (SSPM)", url: "https://swisspsychedelic.ch/", scale: 0.8 }
  ],
  "Media Partners": [
    { src: "/img/partners/maps.png", alt: "MAPS (Multidisciplinary Association for Psychedelic Studies)", url: "https://maps.org/" },
    { src: "/img/partners/open-foundation.png", alt: "OPEN Foundation", url: "https://open-foundation.org/" },
    { src: "/img/partners/ciis.png", alt: "California Institute of Integral Studies (CIIS)", url: "https://www.ciis.edu/" },
    { src: "/img/partners/cannatrade.png", alt: "CannaTrade", url: "https://www.cannatrade.ch/" },
    { src: "/img/partners/psychedelics-today.png", alt: "Psychedelics Today", url: "https://psychedelicstoday.com/" },
    { src: "/img/partners/blossom.png", alt: "Blossom", url: "https://blossomanalysis.com/" },
    { src: "/img/partners/simepsi.png", alt: "SIMEPSI (Società Italiana Medicina Psichedelica)", url: "https://simepsi.it/" },
    { src: "/img/partners/psbe.png", alt: "PSBE (Psychedelic Society Belgium)", url: "https://psychedelicsocietybelgium.org/" }
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
      id="partners"
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
                {logos.map((partner, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3"
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