import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { ArrowUpRight, Mail } from "lucide-react";
import { withBase } from "../lib/withBase";
import { NEWSLETTER_SIGNUP_URL, YOUTUBE_CHANNEL_URL } from "../data/postConference";

// Directly below the hero once the conference is over: the group photo and a thank-you.
export default function ThankYou() {
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
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="thank-you" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <p className="section-eyebrow">9–10 October 2026 · Aarau</p>
          <h2 className="section-title mb-5">Thank you</h2>
          <p className="text-white/80 text-base sm:text-[1.05rem] leading-relaxed">
            The sixth ALPS Conference is behind us. Thank you to our speakers, workshop leaders,
            artists and poster presenters, to our sponsors and partners, to the team of the Kultur &
            Kongresshaus Aarau, to every volunteer who carried these days, and to all of you who came
            to Aarau to listen, ask and talk.
          </p>
        </div>

        <figure data-fade-up className="opacity-0">
          <div className="rounded-[1.25rem] border border-white/10 overflow-hidden bg-white/[0.03]">
            <img
              src={withBase("img/thank-you/group-photo-1200.jpg")}
              srcSet={`${withBase("img/thank-you/group-photo-1200.jpg")} 1200w, ${withBase("img/thank-you/group-photo-2400.jpg")} 2400w`}
              sizes="(min-width: 1152px) 1104px, calc(100vw - 2rem)"
              width={2400}
              height={1489}
              loading="lazy"
              decoding="async"
              alt="Group photo of speakers, volunteers and attendees on the main stage of the Kultur & Kongresshaus Aarau, the ALPS logo on the screen behind them"
              className="block w-full h-auto"
            />
          </div>
          <figcaption className="mt-3 text-sm text-white/55 text-center">
            The ALPS Conference 2026 community on Saturday, 10 October. Photo: Max Lüdicke
          </figcaption>
        </figure>

        <div data-fade-up className="opacity-0 mt-10 sm:mt-12 text-center max-w-2xl mx-auto">
          <p className="text-white/75 text-base leading-relaxed mb-6">
            The talks were recorded and will be published on our YouTube channel. To hear about them and
            about the next ALPS events, sign up for the newsletter on alps.foundation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={NEWSLETTER_SIGNUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
            >
              <Mail className="h-5 w-5 shrink-0" aria-hidden="true" />
              Stay in touch
            </a>
            <a
              href={YOUTUBE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-7 py-3.5 text-base font-medium text-white bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-sm transition-colors duration-200"
            >
              ALPS on YouTube
              <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
