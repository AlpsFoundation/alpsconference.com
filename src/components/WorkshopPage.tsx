import type { ElementType, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import {
  Award,
  CalendarDays,
  Clock,
  HeartHandshake,
  Rows3,
  Utensils,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { withBase } from "../lib/withBase";
import { WORKSHOP_TRACKS, type WorkshopSpeaker as Speaker, type WorkshopTrack } from "../data/workshops";

const LOGISTICS = [
  {
    icon: CalendarDays,
    label: "Date",
    value: "Thursday, October 8th, 2026",
  },
  {
    icon: Clock,
    label: "Time",
    value: "13:00 – 17:00",
  },
  {
    icon: Utensils,
    label: "Included",
    value: "Scheduled snack break",
  },
  {
    icon: Rows3,
    label: "Format",
    value: "Four parallel clinical training tracks",
  },
];


function useScrollFade(ref: React.RefObject<HTMLElement | null>) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [24, 0],
            delay: (_: unknown, i: number) => i * 85,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

function SectionIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div data-fade-up className="opacity-0 mb-12">
      <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">{eyebrow}</p>
      <h2 className="text-3xl font-semibold text-white mb-4">{title}</h2>
      {children && <div className="max-w-3xl text-white/70 text-base sm:text-lg leading-relaxed">{children}</div>}
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }: { icon: ElementType; label: string; value: string }) {
  return (
    <div data-fade-up className="opacity-0 bg-white/[0.03] border border-white/[0.07] rounded-sm p-5">
      <Icon className="w-5 h-5 text-accent-light mb-4" />
      <p className="text-sm uppercase tracking-[0.16em] text-white/45 mb-1">{label}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <article className="rounded-sm border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex flex-col sm:flex-row gap-5">
        {speaker.image && (
          <figure className="w-1/2 shrink-0 sm:w-40">
            <img
              src={withBase(`img/speakers/${speaker.image}`)}
              alt={speaker.name}
              className="aspect-[2/3] w-full rounded-sm border border-white/10 object-cover"
            />
            {speaker.photoCredit && (
              <figcaption className="mt-1 text-xs text-white/50">{speaker.photoCredit}</figcaption>
            )}
          </figure>
        )}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">{speaker.name}</h4>
          <p className="text-white/65 text-base leading-relaxed">{speaker.bio}</p>
        </div>
      </div>
    </article>
  );
}

function TrackCard({ track }: { track: WorkshopTrack }) {
  return (
    <article data-fade-up className="opacity-0 rounded-sm border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between mb-7">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-sm font-semibold text-accent-light">
              <span aria-hidden="true" className="text-base leading-none">
                {track.flag}
              </span>
              {track.language}
            </span>
            <span className="text-sm text-white/45">{track.places} places</span>
          </div>
          <h3 className="text-2xl font-semibold text-white leading-tight">{track.title}</h3>
        </div>
      </div>

      <div className="space-y-4 text-white/72 text-base leading-relaxed">
        {track.abstract.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {track.bullets && (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {track.bullets.map((item) => (
            <li key={item} className="flex gap-2.5 text-white/70 text-base leading-relaxed">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-light/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      {track.sharedImage ? (
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(16rem,0.9fr)_minmax(0,1.6fr)]">
          <figure className="w-1/2 overflow-hidden rounded-sm border border-white/[0.08] bg-white/[0.02] lg:w-full">
            <img
              src={withBase(`img/speakers/${track.sharedImage.src}`)}
              alt={track.sharedImage.alt}
              className="aspect-[2/3] w-full object-cover"
            />
          </figure>
          <div className="grid gap-4">
            {track.speakers.map((speaker) => (
              <SpeakerCard key={speaker.name} speaker={speaker} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {track.speakers.map((speaker) => (
            <SpeakerCard key={speaker.name} speaker={speaker} />
          ))}
        </div>
      )}
    </article>
  );
}

export default function WorkshopPage() {
  const heroRef = useRef<HTMLElement>(null);
  const conceptRef = useRef<HTMLElement>(null);
  const ticketsRef = useRef<HTMLElement>(null);
  const tracksRef = useRef<HTMLElement>(null);

  useScrollFade(heroRef);
  useScrollFade(conceptRef);
  useScrollFade(ticketsRef);
  useScrollFade(tracksRef);

  return (
    <>
      <Navbar />

      <main>
        <section ref={heroRef} className="workshop-hero relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
          <ParticlesCanvas variant="workshopHero" />
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p data-fade-up className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4">
              Pre-Conference Workshop Day
            </p>
            <h1 data-fade-up className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              PAT Training Across Switzerland's Linguistic Regions
            </h1>
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-8">
              A specialized platform for Psychedelic-Assisted Therapy training, combining theoretical input
              with experiential clinical practice in four parallel language tracks.
            </p>
            <div data-fade-up className="opacity-0 flex justify-center mb-10">
              <div className="inline-flex items-center gap-3 rounded-full border border-support/35 bg-gradient-to-r from-support/20 via-support/10 to-accent/10 px-5 py-2.5 shadow-[0_0_28px_rgba(46,124,199,0.18)]">
                <Award className="h-5 w-5 text-support-light" />
                <span className="text-sm sm:text-base font-semibold text-white">
                  Earn 4 FSP credits
                </span>
              </div>
            </div>
            <div data-fade-up className="opacity-0 flex flex-wrap justify-center gap-3">
              <a
                href="https://infomaniak.events/fr-ch/shop/alps-conference-2026-RQNBE4WPQY/event/1629286/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
              >
                Buy Workshop Ticket
              </a>
              <a
                href="#tracks"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-sm transition-colors duration-200"
              >
                Explore Tracks
              </a>
            </div>
          </div>
        </section>

        <section ref={conceptRef} className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionIntro eyebrow="Program concept & logistics" title="One Afternoon, Four Parallel Tracks">
              <p>
                Four parallel clinical training tracks reflecting Switzerland's multilingual landscape. No prior experience required.
              </p>
            </SectionIntro>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {LOGISTICS.map((item) => (
                <InfoCard key={item.label} {...item} />
              ))}
            </div>

            <div data-fade-up className="opacity-0 mt-10 rounded-sm border border-accent/20 bg-accent/10 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <HeartHandshake className="mt-1 h-6 w-6 shrink-0 text-accent-light" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Clinical Learning Format</h3>
                  <p className="text-white/70 text-base leading-relaxed">
                    Each track combines focused theoretical input with experiential structures, giving
                    participants a clinically grounded setting for reflection, practice, and exchange.
                    The workshops are open to everyone — clinicians, researchers, students, and anyone
                    with an interest in psychedelic-assisted therapy.
                  </p>
                  <div className="mt-4 flex items-start gap-3 rounded-sm border border-support/25 bg-support/10 px-4 py-3">
                    <Award className="mt-0.5 h-5 w-5 shrink-0 text-support-light" />
                    <p className="text-sm text-white/75 leading-relaxed">
                      Earn <span className="font-semibold text-white">4 FSP credits</span> (medical
                      professionals &amp; psychologists). Certificate of attendance provided after the
                      event.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={ticketsRef} id="tickets" className="relative py-24 sm:py-32">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionIntro eyebrow="Tickets" title="Buy Workshop Tickets">
              <p>Seats are limited across the four parallel tracks. Prices are listed in Swiss francs.</p>
            </SectionIntro>
            <div className="flex justify-center mt-10">
              <a
                href="https://infomaniak.events/fr-ch/shop/alps-conference-2026-RQNBE4WPQY/event/1629286/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-4 text-base font-semibold text-white transition-colors"
              >
                Buy Workshop Tickets
              </a>
            </div>
            <p data-fade-up className="opacity-0 text-sm text-white/55 mt-8 mb-3">
              When purchasing, please indicate your preferred workshop track in the order notes so we can plan accordingly.
            </p>
            <div data-fade-up className="opacity-0 grid gap-3 grid-cols-2 lg:grid-cols-4">
              {WORKSHOP_TRACKS.map((track) => (
                <div key={track.language} className="flex items-center justify-between rounded-sm border border-white/[0.07] bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-white/80 text-sm font-medium">
                    <span aria-hidden="true">{track.flag}</span>
                    {track.language}
                  </span>
                  <span className="text-sm text-white/45">{track.places} places</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={tracksRef} id="tracks" className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionIntro eyebrow="Abstracts & bios" title="Parallel Workshop Tracks">
              <p>
                Choose one of four specialized tracks led by experienced clinicians and trainers working
                across Switzerland's linguistic regions.
              </p>
            </SectionIntro>

            <div className="grid gap-8">
              {WORKSHOP_TRACKS.map((track) => (
                <TrackCard key={track.language} track={track} />
              ))}
            </div>
          </div>
        </section>

      </main>

      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Footer />
      </div>
    </>
  );
}
