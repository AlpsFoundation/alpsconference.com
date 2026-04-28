import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { MapPin, Train, Building2, Utensils } from "lucide-react";
import { withBase } from "../lib/withBase";
import { useTranslation } from "../lib/i18n";

const venueInteriorImage = withBase("img/kuk-inside.jpg");
const venueExteriorImage = withBase("img/kuk-outside.jpg");

export default function Location() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const FEATURES = [
    { icon: Building2, text: t.location.features.space },
    { icon: MapPin, text: t.location.features.square },
    { icon: Train, text: t.location.features.train },
    { icon: Utensils, text: t.location.features.dining },
  ];

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
    <section
      ref={sectionRef}
      id="location"
      className="relative overflow-hidden py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-20 -z-10 h-72 bg-[radial-gradient(circle_at_center,rgba(74,154,224,0.18),transparent_72%)] blur-3xl" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            {t.location.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold text-white">
            {t.location.heading}
          </h2>
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
          <div data-fade-up className="order-2 opacity-0 lg:order-1">
            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.03] shadow-[0_24px_80px_rgba(3,8,24,0.45)]">
              <div className="aspect-[4/2.35] sm:aspect-[4/3] bg-neutral-dark/60">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2715.5!2d8.0461!3d47.3925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47903be85ee8f3d9%3A0x1b5f1e8b1e0e1e0e!2sKultur+%26+Kongresshaus+Aarau!5e0!3m2!1sen!2sch!4v1"
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                    filter: "invert(0.9) hue-rotate(180deg) saturate(0.3) brightness(0.8)",
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t.location.mapTitle}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70">
                <MapPin className="h-4 w-4 text-support-light" />
                <span>Schlossplatz, Aarau</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-white/70">
                <Train className="h-4 w-4 text-support-light" />
                <span>{t.location.shortWalk}</span>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(74,154,224,0.4),rgba(255,255,255,0.12)_42%,rgba(11,60,93,0.24))] p-px shadow-[0_20px_56px_rgba(3,8,24,0.35)]">
                <div className="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white/[0.03]">
                  <div className="aspect-[4/3]">
                    <img
                      src={venueInteriorImage}
                      alt={t.location.imgAltInterior}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,rgba(74,154,224,0.4),rgba(255,255,255,0.12)_42%,rgba(11,60,93,0.24))] p-px shadow-[0_20px_56px_rgba(3,8,24,0.35)]">
                <div className="overflow-hidden rounded-[calc(1.5rem-1px)] bg-white/[0.03]">
                  <div className="aspect-[4/3]">
                    <img
                      src={venueExteriorImage}
                      alt={t.location.imgAltExterior}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 space-y-6 lg:order-2 lg:pt-4">
            <div
              data-fade-up
              className="opacity-0 inline-flex items-center rounded-full border border-support/20 bg-support/10 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.2em] text-support-light/90"
            >
              {t.location.badge}
            </div>

            <p data-fade-up className="opacity-0 text-white/90 leading-relaxed text-base sm:text-[1.05rem]">
              {t.location.p1}
            </p>
            <p data-fade-up className="opacity-0 text-white/90 leading-relaxed text-base sm:text-[1.05rem]">
              {t.location.p2}
            </p>

            <div data-fade-up className="opacity-0 grid gap-3 pt-3 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div
                  key={f.text}
                  className="flex items-start gap-3 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] px-4 py-4 text-base shadow-[0_16px_40px_rgba(3,8,24,0.2)]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-support/12">
                    <f.icon className="h-4 w-4 text-support-light" />
                  </div>
                  <span className="text-white/78 leading-relaxed">{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
