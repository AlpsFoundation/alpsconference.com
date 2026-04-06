import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { MapPin, Train, Building2, Utensils } from "lucide-react";

const FEATURES = [
  { icon: Building2, text: "1000m\u00B2 of flexible event space" },
  { icon: MapPin, text: "Historic Schlossplatz, heart of Aarau" },
  { icon: Train, text: "Steps from Aarau train station" },
  { icon: Utensils, text: "Surrounded by dining & leisure options" },
];

export default function Location() {
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
    <section ref={sectionRef} id="location" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            The Venue
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Kultur & Kongresshaus Aarau
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Map embed */}
          <div data-fade-up className="opacity-0 aspect-video rounded-sm overflow-hidden border border-white/[0.06] shadow-2xl">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2715.5!2d8.0461!3d47.3925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47903be85ee8f3d9%3A0x1b5f1e8b1e0e1e0e!2sKultur+%26+Kongresshaus+Aarau!5e0!3m2!1sen!2sch!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "invert(0.9) hue-rotate(180deg) saturate(0.3) brightness(0.8)" }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kultur & Kongresshaus Aarau location"
            />
          </div>

          {/* Info */}
          <div className="space-y-6">
            <p data-fade-up className="opacity-0 text-white/90 leading-relaxed text-base">
              The Kultur & Kongresshaus Aarau, located at Schlossplatz in Aarau, combines
              architectural elegance with modern functionality. The facility boasts high ceilings
              on the ground floor providing a sense of openness and grandeur, with advanced
              event technology ensuring all technical needs are seamlessly met.
            </p>
            <p data-fade-up className="opacity-0 text-white/90 leading-relaxed text-base">
              A spacious foyer serves as a welcoming area and exhibition space. Located near
              the heart of Aarau's historic center, surrounded by dining and leisure options,
              it's a prime spot for local and international attendees alike.
            </p>

            <div data-fade-up className="opacity-0 grid grid-cols-2 gap-4 pt-4">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-start gap-3 text-base">
                  <div className="w-8 h-8 rounded-sm bg-support/10 flex items-center justify-center shrink-0">
                    <f.icon className="w-4 h-4 text-support-light" />
                  </div>
                  <span className="text-white/80 mt-1">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}