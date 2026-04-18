import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function Tickets() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

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
    // Load the ticket shop script
    if (!scriptRef.current) {
      const script = document.createElement("script");
      script.id = "etickets";
      script.src = "https://infomaniak.events/scripts/shop/NWT3HX6EG2";
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
    };
  }, []);

  return (
    <section ref={sectionRef} id="tickets" className="relative py-24 sm:py-32 bg-white/[0.02]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Registration
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Get Your Tickets
          </h2>
        </div>

        <div data-fade-up className="opacity-0">
          {/* The embedded ticket shop will render here via the script */}
          <div id="etickets-container" className="min-h-[400px]" />
        </div>
      </div>
    </section>
  );
}
