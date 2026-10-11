import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Mail } from "lucide-react";
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">
            About the conference
          </p>
          <h2 className="section-title">
            ALPS 2026 in Aarau
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
              title="ALPS Conference 2026 invitation video"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="space-y-4 text-base sm:text-[1.05rem] text-white/78 leading-relaxed text-left">
          <p data-fade-up className="opacity-0">
            The sixth edition of the ALPS Awareness Lectures on Psychedelic Science took place on <strong>Friday and Saturday, 9–10 October 2026</strong>, at the Kultur &amp; Kongresshaus in <strong>Aarau, Switzerland</strong>.
          </p>
          <p data-fade-up className="opacity-0">
            Over two full days, speakers and panels shared recent advances in psychedelic research and therapy. For the first time, ALPS 2026 opened with a dedicated <a href={withBase("/workshops")} className="text-support-light hover:text-white transition-colors underline underline-offset-4">Workshop Day</a> on Thursday, 8 October, with three parallel PAT training tracks before the conference began. The conference was held in English.
          </p>
          <p data-fade-up className="opacity-0">
            Catering was vegetarian throughout, from breakfast and the breaks to lunch and the Saturday-evening apéro, with an optional networking dinner on Friday evening. Between sessions, researchers, practitioners and everyone curious about the field met over apéros, and the conference closed with our traditional afterparty on Saturday night.
          </p>
          <p data-fade-up className="opacity-0">
            The conference was accredited for up to 14 FSP credits and up to 10 SGPP credits for psychologists and medical professionals.
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
              Thursday, 8 October 2026
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Pre-conference Workshop Day</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            ALPS 2026 began with an afternoon of Psychedelic-Assisted Therapy training in English,
            German and French tracks, combining theoretical input with experiential clinical practice.
          </p>
          <a
            href={withBase("/workshops")}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
          >
            About the Workshop Day
          </a>
          </div>

          <div
            data-fade-up
            className="opacity-0 rounded-[1.25rem] border border-white/10 bg-white/[0.03] p-6 sm:p-7 text-left"
          >
          <div className="mb-4">
            <span className="text-sm uppercase tracking-[0.18em] text-white/50">
              After the conference
            </span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">Certificates of participation</h3>
          <p className="text-white/72 text-base sm:text-lg leading-relaxed mb-6">
            Attended ALPS 2026 and need a certificate of participation? Email us at
            info@alps.foundation and we will send it to you.
          </p>
          <a
            href="mailto:info@alps.foundation?subject=ALPS%202026%20certificate%20of%20participation"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-sm transition-colors duration-200"
          >
            <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
            Request a certificate
          </a>
          </div>
        </div>
      </div>
    </section>
  );
}
