import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { ArrowUpRight, Mail } from "lucide-react";
import { NEWSLETTER_SIGNUP_URL } from "../data/postConference";

// After the conference the ALPS newsletter sign-up lives on alps.foundation; this section points there.
export default function Newsletter() {
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="newsletter" className="relative py-24 sm:py-32">
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <div data-fade-up className="opacity-0">
          <p className="section-eyebrow">Stay in touch</p>
          <h2 className="section-title mb-4">Hear about the next ALPS events</h2>
          <p className="text-white/90 mb-8 text-base">
            The ALPS newsletter lives on alps.foundation: occasional updates on ALPS events, talks and
            psychedelic science in Switzerland.
          </p>
        </div>

        <div data-fade-up className="opacity-0 flex justify-center">
          <a
            href={NEWSLETTER_SIGNUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-support hover:bg-support-light text-white font-medium rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-support/20 text-base"
          >
            <Mail className="w-5 h-5 shrink-0" aria-hidden="true" />
            Sign up on alps.foundation
            <ArrowUpRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
