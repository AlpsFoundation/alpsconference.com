import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

const CERTIFICATE_EMAIL = "mailto:info@alps.foundation?subject=Certificate%20of%20participation%20%E2%80%93%20ALPS%202026";

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">
            About the Conference
          </p>
          <h2 className="section-title">
            Looking back on ALPS 2026
          </h2>
        </div>

        <div className="grid gap-7 lg:grid-cols-2 lg:gap-4 lg:items-start">
          <div
            data-fade-up
            className="w-full opacity-0 rounded-[1.25rem] border border-white/10 overflow-hidden aspect-[4/3] lg:sticky lg:top-24"
          >
            <iframe
              className="w-full h-full"
              src="https://www.youtube-nocookie.com/embed/_3iQxlvqZog?iv_load_policy=3&playsinline=1&rel=0&modestbranding=1"
              title="ALPS Conference 2026 — you're invited"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="space-y-4 text-base sm:text-[1.05rem] text-white/78 leading-relaxed text-left">
          <p data-fade-up className="opacity-0">
            On <strong>Friday and Saturday, October 9–10, 2026</strong>, the sixth edition of the ALPS Awareness Lectures on Psychedelic Science brought researchers, practitioners, and enthusiasts together at the Kultur &amp; Kongresshaus in <strong>Aarau, Switzerland</strong>.
          </p>
          <p data-fade-up className="opacity-0">
            Two full days of cutting-edge science, meaningful dialogue, and community building: distinguished speakers and interactive panels shared the latest advancements in psychedelic research and therapy, alongside research posters and immersive experiences. For the first time, ALPS also opened with a dedicated <a href={withBase("/workshops")} className="text-support-light hover:text-white transition-colors underline underline-offset-4">Workshop Day</a> on Thursday, October 8th, with three parallel PAT training tracks.
          </p>
          <p data-fade-up className="opacity-0">
            Between the sessions, we shared vegetarian meals and apéros, the Friday networking dinner, and our traditional After Party on Saturday night.
          </p>
          <p data-fade-up className="opacity-0">
            Thank you to every speaker, attendee, partner, and volunteer who made it happen. We look forward to welcoming you to ALPS Conference VII.
          </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <div
            data-fade-up
            className="opacity-0 rounded-[1.25rem] border border-accent/25 bg-accent/10 p-6 sm:p-7 text-left"
          >
          <div className="mb-4">
            <span className="text-sm uppercase tracking-[0.18em] text-accent-light">
              Thursday, October 8th, 2026
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Pre-Conference Workshop Day</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            ALPS 2026 opened with a specialized afternoon of Psychedelic-Assisted Therapy training across
            English, German, and French tracks, combining theoretical input with experiential
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
            className="opacity-0 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-6 sm:p-7 text-left"
          >
          <div className="mb-4">
            <span className="text-sm uppercase tracking-[0.18em] text-white/50">
              Friday–Saturday, October 9–10, 2026
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Certificates of Participation</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            The conference is accredited for up to 14 FSP credits and up to 10 SGPP credits for
            psychologists and medical professionals. Email us to request your certificate of
            participation.
          </p>
          <a
            href={CERTIFICATE_EMAIL}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
          >
            Request a Certificate
          </a>
          </div>
        </div>
      </div>
    </section>
  );
}
