import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

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
            Join us for two full days of cutting-edge science, meaningful dialogue, and community building. This year's conference will feature distinguished speakers and interactive panels, providing deep insights into the latest advancements in psychedelic research and therapy. For the first time, ALPS 2026 also opens with a dedicated <a href={withBase("/workshops")} className="text-support-light hover:text-white transition-colors underline underline-offset-4">Workshop Day</a> on Thursday, October 8th, offering four parallel PAT training tracks before the conference begins. The conference will be held in English.
          </p>
          <p data-fade-up className="opacity-0">
            Your conference experience includes comprehensive catering with breakfast, morning and afternoon breaks, lunch, and Saturday-evening Apero, ensuring a comfortable and enriching environment. For Friday evening, an optional networking dinner will be available. Throughout the event, take advantage of the networking breaks to connect with fellow enthusiasts, researchers, and practitioners over apéros, and join us for our traditional After Party on Saturday night.
          </p>
          <p data-fade-up className="opacity-0">
            Attendees will have the opportunity to earn up to 14 continuing education credits, accredited by FSP and SGPP for psychologists and medical professionals. We look forward to hosting an engaging and enlightening conference that promises to expand knowledge and foster significant discussions.
          </p>
        </div>

        <div
          data-fade-up
          className="opacity-0 mt-12 rounded-sm border border-accent/25 bg-accent/10 p-6 sm:p-8 text-left"
        >
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-neutral-dark">
              New
            </span>
            <span className="text-sm uppercase tracking-[0.18em] text-accent-light">
              Thursday, October 8th, 2026
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Pre-Conference Workshop Day</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            Start ALPS 2026 with a specialized afternoon of Psychedelic-Assisted Therapy training across
            English, Italian, French, and German tracks, combining theoretical input with experiential
            clinical practice.
          </p>
          <a
            href={withBase("/workshops")}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
          >
            Explore Workshop Day
          </a>
        </div>

        <div
          data-fade-up
          className="opacity-0 mt-6 rounded-sm border border-white/10 bg-white/[0.03] p-6 sm:p-8 text-left"
        >
          <div className="mb-4">
            <span className="text-sm uppercase tracking-[0.18em] text-white/50">
              Friday–Saturday, October 9–10, 2026
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Conference Tickets</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            Secure your place at ALPS 2026. Tickets include entry to both conference days, catering,
            networking apéro, and Saturday After Party.
          </p>
          <a
            href="https://infomaniak.events/en-ch/conferences/alps-conference-2026/c2484795-1ae7-4b4b-aa21-c9b8f085008c/events/382409"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-colors duration-200"
          >
            Buy Conference Tickets
          </a>
        </div>
      </div>
    </section>
  );
}
