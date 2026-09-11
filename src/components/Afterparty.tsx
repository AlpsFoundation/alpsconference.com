import { useRef, useEffect } from "react";
import { animate } from "animejs";

const LINEUP = [
  { name: "Enero", genre: "Melodic Techno" },
  { name: "Psyre", genre: "Psychedelic Techno" },
  { name: "Adage", genre: "Hard Techno" },
  { name: "DK ∞", genre: "Progressive Jungle Psy" },
];

const EVENTFROG_URL = "https://eventfrog.ch";

export default function Afterparty() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const targets = section.querySelectorAll<HTMLElement>("[data-fade-up]");
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animate(entry.target, {
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 600,
            easing: "easeOutQuad",
          });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="afterparty"
      className="relative border-t border-white/10 py-14 sm:py-16"
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div data-fade-up className="opacity-0">
          <p className="section-eyebrow">After the conference</p>
          <h2 className="section-title mt-3">Afterparty</h2>
          <p className="mt-4 max-w-xl text-white/70 text-sm leading-relaxed">
            The conference closes with a private afterparty — an evening of music to close the day together.
            Doors open at <span className="text-support-light font-medium">10 pm</span>, the night runs until{" "}
            <span className="text-support-light font-medium">4 am</span>.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {/* Lineup */}
          <div
            data-fade-up
            className="opacity-0 bg-white/[0.02] border border-white/[0.05] rounded-[1.25rem] p-5 sm:p-6"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Lineup</p>
            <ul className="space-y-3">
              {LINEUP.map(({ name, genre }) => (
                <li key={name} className="flex items-baseline justify-between gap-3">
                  <span className="text-white/90 font-medium">{name}</span>
                  <span className="text-white/40 text-xs shrink-0">{genre}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Venue & Tickets */}
          <div
            data-fade-up
            className="opacity-0 bg-white/[0.02] border border-white/[0.05] rounded-[1.25rem] p-5 sm:p-6 flex flex-col gap-5"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Venue</p>
              <p className="text-white/90 text-sm font-medium leading-snug">Jugendkulturhaus Flösserplatz</p>
              <p className="text-white/50 text-xs mt-0.5">Flösserstrasse 7, 5000 Aarau</p>
              <p className="text-white/40 text-xs mt-1">5 minutes on foot from the conference</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Tickets</p>
              <p className="text-white/70 text-sm leading-relaxed">
                Entry is <span className="text-white/90 font-medium">included</span> in your conference ticket.
              </p>
              <p className="text-white/50 text-xs mt-2 leading-relaxed">
                ALPS & SPSN Friends &amp; Family can purchase a separate ticket via{" "}
                <a
                  href={EVENTFROG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-support-light underline decoration-support-light/30 underline-offset-2 hover:decoration-support-light/70 transition-colors"
                >
                  eventfrog
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
