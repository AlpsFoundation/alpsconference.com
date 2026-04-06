import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Mic2, FileText, MessagesSquare, Award } from "lucide-react";

const DISCOVER_ITEMS = [
  {
    icon: Mic2,
    title: "National & International Speakers",
    desc: "Leading researchers and practitioners sharing cutting-edge insights",
  },
  {
    icon: FileText,
    title: "Research Posters",
    desc: "Showcasing the latest findings in psychedelic science",
  },
  {
    icon: MessagesSquare,
    title: "Panel Discussions",
    desc: "Engaging dialogues on the future of psychedelic research",
  },
];

export default function Conference() {
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
            translateY: [40, 0],
            delay: (_: unknown, i: number) => i * 150,
            duration: 800,
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
    <section ref={sectionRef} id="conference" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-16">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Come discover
          </p>
          <h2 className="text-3xl font-semibold text-white">
            What awaits you
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {DISCOVER_ITEMS.map((item) => (
            <div
              key={item.title}
              data-fade-up
              className="opacity-0 group relative p-6 sm:p-8 rounded-sm bg-white/[0.03] border border-white/[0.06] hover:border-support/30 hover:bg-white/[0.05] transition-all duration-500"
            >
              <div className="w-12 h-12 rounded-sm bg-support/10 flex items-center justify-center mb-5 group-hover:bg-support/20 transition-colors duration-300">
                <item.icon className="w-6 h-6 text-support-light" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-base text-white/80 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Credits badge */}
        <div data-fade-up className="opacity-0 flex justify-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-sm bg-support/10 border border-support/20">
            <Award className="w-5 h-5 text-support-light" />
            <span className="text-base font-medium text-support-light">
              Receive up to 14 credits
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}