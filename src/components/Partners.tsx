import { useEffect, useRef } from "react";
import { animate } from "animejs";

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
            delay: (_: unknown, i: number) => i * 100,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="sponsoring" className="relative py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div data-fade-up className="opacity-0 mb-12">
          <p className="text-sm tracking-[0.2em] uppercase text-support font-medium mb-3">
            Academic Partners
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white text-glow">
            Supported by leading institutions
          </h2>
        </div>

        <div data-fade-up className="opacity-0 flex justify-center">
          <div className="w-full max-w-3xl p-8 sm:p-10 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <img
              src="/img/partners.jpg"
              alt="Academic partners: HUG, Universitat Zurich, Swiss Psychedelic Student Network, Universitat Basel, Universite de Fribourg"
              className="w-full h-auto opacity-80 hover:opacity-100 transition-opacity duration-500 brightness-110 invert"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
