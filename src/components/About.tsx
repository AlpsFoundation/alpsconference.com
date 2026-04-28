import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { useTranslation } from "../lib/i18n";

export default function About() {
  const { t } = useTranslation();
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

  return (
    <section ref={sectionRef} id="about" className="relative py-24 sm:py-32 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            {t.about.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold text-white">
            {t.about.heading}
          </h2>
        </div>

        <div className="space-y-6 text-lg text-white/80 leading-relaxed text-center">
          <p data-fade-up className="opacity-0" dangerouslySetInnerHTML={{ __html: t.about.p1 }} />
          <p data-fade-up className="opacity-0">{t.about.p2}</p>
          <p data-fade-up className="opacity-0">{t.about.p3}</p>
          <p data-fade-up className="opacity-0">{t.about.p4}</p>
        </div>
      </div>
    </section>
  );
}
