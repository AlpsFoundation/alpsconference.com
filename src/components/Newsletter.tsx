import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Send } from "lucide-react";

export default function Newsletter() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [email, setEmail] = useState("");

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
          <p className="text-sm tracking-[0.2em] uppercase text-accent font-medium mb-3">
            Stay informed
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white text-glow mb-4">
            Newsletter
          </h2>
          <p className="text-secondary/60 mb-8">
            Be the first to know about speakers, schedule updates, and ticket sales.
          </p>
        </div>

        <form
          data-fade-up
          className="opacity-0 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            // Placeholder for newsletter integration
            alert(`Thanks! We'll notify ${email} when updates are available.`);
            setEmail("");
          }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 px-5 py-3.5 bg-white/[0.05] border border-white/10 rounded-lg text-white placeholder:text-secondary/30 focus:outline-none focus:border-support/50 focus:ring-1 focus:ring-support/30 transition-all"
          />
          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-accent hover:bg-accent-light text-neutral-dark font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-accent/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
