import { useEffect, useRef } from "react";
import { animate } from "animejs";
import {
  CalendarDays,
  Moon,
  Wine,
  PartyPopper,
  Sparkles,
} from "lucide-react";

const ITEMS = [
  { icon: CalendarDays, label: "Pre-Conference Workshop", sub: "October 8" },
  { icon: Moon, label: "Evening Program", sub: "Both evenings" },
  { icon: Wine, label: "Networking Apero", sub: "Meet fellow attendees" },
  { icon: PartyPopper, label: "Saturday Afterparty", sub: "Celebrate together" },
  {
    icon: Sparkles,
    label: "Immersive Side Experiences",
    sub: "Meditation, Breathwork, Music\u2026",
  },
];

export default function Experiences() {
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
            delay: (_: unknown, i: number) => i * 100,
            duration: 700,
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
    <section ref={sectionRef} id="experiences" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-sm tracking-[0.2em] uppercase text-accent font-medium mb-3">
            & more
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white text-glow">
            Beyond the talks
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {ITEMS.map((item) => (
            <div
              key={item.label}
              data-fade-up
              className="opacity-0 flex items-center gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-support/20 hover:bg-white/[0.04] transition-all duration-400"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/40 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-support-light" />
              </div>
              <div>
                <p className="font-medium text-white">{item.label}</p>
                <p className="text-sm text-secondary/50">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
