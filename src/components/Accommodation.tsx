import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { BedDouble, Wallet } from "lucide-react";

const IN_AARAU = [
  {
    name: "Aarauerhof",
    note: "Self check-in city hotel right at Aarau train station, a short walk from Kultur & Kongresshaus Aarau.",
  },
  {
    name: "Hotel Kettenbrücke",
    note: "A few minutes' walk from the station, on the edge of Aarau's Old Town.",
  },
  {
    name: "Gasthof zum Schützen",
    note: "By the Aare river in Aarau, a short walk from the Old Town and the venue.",
  },
];

const ANSTATTHOTEL_PROMO_URL =
  "https://my.anstatthotel.ch/search?MAGIC_PROMO_CODE=4fYHv3M7F6JWEXKhjc8CzS";

type Stay = { name: string; note: string; url?: string; perk?: string };

const NEARBY_BUDGET: Stay[] = [
  {
    name: "Suhr Guest House",
    note: "Budget guesthouse in Suhr, about 10 minutes from Aarau by bus or car.",
  },
  {
    name: "Anstatthotel Schafisheim",
    note: "Serviced apartments in Schafisheim, between Aarau and Lenzburg, about 10 minutes by car.",
    url: ANSTATTHOTEL_PROMO_URL,
    perk: "10% off for ALPS attendees — book directly via this link and the discount is applied automatically.",
  },
  {
    name: "Ochsen Lodge, Lenzburg",
    note: "In the historic castle town of Lenzburg, roughly 10 minutes from Aarau by train.",
  },
  {
    name: "Hotel Engel, Zofingen",
    note: "In Zofingen's old town, about 20 minutes from Aarau by train — a lower-cost alternative.",
  },
];

export default function Accommodation() {
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
    <section id="accommodation" ref={sectionRef} className="relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-8 sm:mb-10">
          <p className="section-eyebrow">Where to stay</p>
          <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Accommodation near the venue
          </h3>
          <p className="mt-3 text-white/70 leading-relaxed max-w-2xl mx-auto text-sm sm:text-base">
            Aarau has a handful of hotels within walking distance of Kultur & Kongresshaus Aarau.
            If you're looking to save on your stay, nearby towns just a short train or bus ride
            away tend to be cheaper.
          </p>
          <p className="mt-4 inline-block rounded-lg border border-support/40 bg-support/10 px-4 py-2.5 text-sm sm:text-base text-white/85 leading-relaxed">
            <strong className="text-white">Budget tip:</strong> get 10% off at{" "}
            <a
              href={ANSTATTHOTEL_PROMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-white underline decoration-support-light underline-offset-4 hover:text-support-light"
            >
              Anstatthotel Schafisheim
            </a>{" "}
            — open this link and book directly through it; the discount is applied automatically.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div data-fade-up className="opacity-0 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <BedDouble className="h-4 w-4 text-support-light" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                In Aarau
              </h4>
            </div>
            <ul className="space-y-3">
              {IN_AARAU.map((item) => (
                <li key={item.name} className="text-sm sm:text-[0.95rem]">
                  <span className="text-white font-medium">{item.name}</span>
                  <span className="block text-white/65 leading-relaxed">{item.note}</span>
                </li>
              ))}
            </ul>
          </div>

          <div data-fade-up className="opacity-0 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-support-light" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-white/80">
                Budget options nearby
              </h4>
            </div>
            <ul className="space-y-3">
              {NEARBY_BUDGET.map((item) => (
                <li key={item.name} className="text-sm sm:text-[0.95rem]">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium underline decoration-white/30 underline-offset-4 hover:decoration-white"
                    >
                      {item.name}
                    </a>
                  ) : (
                    <span className="text-white font-medium">{item.name}</span>
                  )}
                  {item.perk && (
                    <span className="ml-2 inline-block rounded-full bg-support/25 px-2 py-0.5 align-middle text-[0.7rem] font-semibold uppercase tracking-wide text-support-light">
                      10% off
                    </span>
                  )}
                  <span className="block text-white/65 leading-relaxed">{item.note}</span>
                  {item.perk && (
                    <span className="block text-support-light leading-relaxed">{item.perk}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p data-fade-up className="opacity-0 mt-6 text-center text-white/55 text-sm">
          Airbnb and other short-term rental platforms are also worth checking, in Aarau and the
          surrounding towns.
        </p>
      </div>
    </section>
  );
}
