import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function About() {
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
            About the Conference
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Welcome to ALPS 2026
          </h2>
        </div>

        <div className="space-y-6 text-lg text-white/80 leading-relaxed text-center">
          <p data-fade-up className="opacity-0">
            The ALPS Foundation is delighted to invite you to the sixth edition of the ALPS Awareness Lectures on Psychedelic Science, taking place on <strong>Friday and Saturday, October 9–10, 2026</strong>, in the scenic city of <strong>Aarau, Switzerland</strong>.
          </p>
          <p data-fade-up className="opacity-0">
            Join us for two full days of cutting-edge science, meaningful dialogue, and community building. This year's conference will feature distinguished speakers and interactive panels, providing deep insights into the latest advancements in psychedelic research and therapy. The conference will be held in English.
          </p>
          <p data-fade-up className="opacity-0">
            Your conference experience includes comprehensive catering with breakfast, morning and afternoon breaks, lunch, and dinner, ensuring a comfortable and enriching environment. Throughout the event, take advantage of the networking breaks to connect with fellow enthusiasts, researchers, and practitioners over apéros, and join us for our traditional After Party on Saturday night.
          </p>
          <p data-fade-up className="opacity-0">
            Attendees will have the opportunity to earn up to 14 continuing education credits, accredited by FSP and SGPP for psychologists and medical professionals. We look forward to hosting an engaging and enlightening conference that promises to expand knowledge and foster significant discussions.
          </p>
        </div>
      </div>
    </section>
  );
}
