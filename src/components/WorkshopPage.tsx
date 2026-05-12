import type { ElementType, ReactNode } from "react";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import {
  CalendarDays,
  Clock,
  HeartHandshake,
  Hourglass,
  Rows3,
  Utensils,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { withBase } from "../lib/withBase";

type Speaker = {
  name: string;
  bio: string;
  image?: string;
};

type WorkshopTrack = {
  language: string;
  flag: string;
  presenters: string;
  title: string;
  places: number;
  abstract: string[];
  bullets?: string[];
  sharedImage?: {
    src: string;
    alt: string;
  };
  speakers: Speaker[];
};

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


const WORKSHOP_TRACKS: WorkshopTrack[] = [
  {
    language: "English",
    flag: "🇬🇧",
    presenters: "Lea Stocker and Robert Fischer",
    places: 18,
    title: "Let's talk about sex (in PAT) - how to integrate a vulnerable subject in a vulnerable setting",
    abstract: [
      "Sexuality is widely still a taboo subject in therapy, and probably in PAT even more so, given the vulnerable setting. We will introduce a basic literacy to therapeutic approaches of sexual topics in general and in connection with PAT.",
      "The workshop will offer theoretical background and experiential structures. The main goal is to foster therapists' security as they navigate sexual topics in PAT and other settings.",
    ],
    speakers: [
      {
        name: "Lea Stocker",
        image: "lea-stocker.jpg",
        bio: "Lea works as an integral doctor in her own practice. She specialized in general internal medicine and in psychiatry and psychotherapy. Her therapeutic background comprises Gestalt, catathymic imaginative, behavioural, and mindfulness-based methods alongside training in relational sexual therapy with IBP.",
      },
      {
        name: "Robert Fischer",
        image: "robert-fischer.jpg",
        bio: "Robert, who originally trained as a doctor and specialises in psychiatry and psychotherapy, works primarily with individuals, couples, and groups using psychotherapeutic approaches. In addition, he trains body psychotherapists and sex therapists.",
      },
    ],
  },
  {
    language: "German",
    flag: "🇩🇪",
    presenters: "Helena Aicher und Stephanie Buschner",
    places: 18,
    title: "Therapeutische Haltung und Atem-Selbsterfahrung - Erfahrungsorientierter Workshop zu relevanten Aspekten der PAT",
    abstract: [
      "Dieser Pre-Conference Workshop lädt dazu ein, ausgewählte Aspekte der Psychedelika-assistierten Therapie in einem erfahrungsorientierten Rahmen kennenzulernen. Kurze theoretische Inputs werden mit praktischen Übungen, gemeinsamer Reflexion und Austausch verbunden.",
      "Teil des Workshops ist eine angeleitete Breathwork-Sequenz im Rundatemstil, die einen geschützten Raum für persönliche Selbsterfahrung schafft. Darüber hinaus widmen wir uns zentralen Aspekten therapeutischer Haltung und Beziehungsgestaltung - darunter Präsenz, ein bewusster Umgang mit Nähe und Distanz sowie eine offene und wertschätzende Haltung.",
      "Der Workshop richtet sich an Therapeut:innen und Fachpersonen aus psychosozialen Arbeits- und Studienfeldern, die Interesse an Psychedelika-assistierter Therapie und erfahrungsorientierten Zugängen haben. Vorkenntnisse sind nicht erforderlich.",
    ],
    speakers: [
      {
        name: "Helena Aicher",
        image: "helena-aicher.jpg",
        bio: "Helena Aicher, PhD, ist Wissenschaftlerin an den Universitäten Zürich und Basel sowie Psychotherapeutin mit einem Schwerpunkt in PAT. Sie ist in der Weiterbildung im Bereich der psychedelischen Forschung und Therapie tätig sowie beratend für verschiedene Institutionen und Organisationen auf diesem Gebiet.",
      },
      {
        name: "Stephanie Buschner",
        image: "stephanie-buschner.jpg",
        bio: "Stephanie Buschner, MSc., ist Oberpsychologin an der Psychiatrischen Universitätsklinik Zürich im Zentrum für Abhängigkeitserkrankungen und arbeitet zudem als Psychotherapeutin mit Schwerpunkt auf PAT in eigener Praxis. Darüber hinaus konzipiert und begleitet sie Weiterbildungsformate im Bereich PAT und setzt sich vertieft mit Fragen therapeutischer Haltung im Spannungsfeld von PAT und Psychotherapie auseinander.",
      },
    ],
  },
  {
    language: "Italian",
    flag: "🇮🇹",
    presenters: "Dr Claudia Ariemma and Simona Porta",
    places: 12,
    title: "Beyond the Symptom: PAT and the Treatment of Eating Disorders in Ticino",
    abstract: [
      "We will present the structure, case history, and working methods of the only Ticino Center for the treatment of eating disorders. We will explore the reasons behind the decision to apply PAT to patients with eating disorders, present clinical cases for discussion, and show the results obtained since December 2024.",
      "Throughout the session, experiential exercises will invite participants to reflect on and embody the themes emerging from the group work. We will outline future projects, particularly the launch of a Certificate of Advanced Studies in Psychedelic-Assisted Therapy at SUPSI, the first Italian-language CAS on this clinical practice, and a SUPSI research project based on the clinical cases treated.",
    ],
    speakers: [
      {
        name: "Claudia Ariemma",
        image: "claudia-ariemma.jpg",
        bio: "Claudia Ariemma is a psychiatrist and Jungian analytical psychotherapist. She holds a certification of professional training in eating disorders and obesity. She has worked for the Ticino public psychiatry department in the cantonal socio-psychiatric organization since 2005 and has been the medical manager of the center for the treatment of eating and nutrition disorders since 2016. In 2024, she trained with part of her multidisciplinary team in Psychedelic-Assisted Therapy, which she has practiced since October 2024.",
      },
      {
        name: "Simona Porta",
        image: "simona-porta.jpg",
        bio: "Simona Porta is a psychologist and psychotherapist with over twenty years of clinical experience in eating disorders and complex psychological distress. She is currently developing a Psychedelic-Assisted Therapy protocol with LSD within a multidisciplinary team at OSC Mendrisio, Switzerland, and is certified in EMDR and mindfulness-based approaches.",
      },
    ],
  },
  {
    language: "French",
    flag: "🇫🇷",
    presenters: "Catherine Duffour and Hervé Duffour",
    places: 12,
    title: "Therapeutic relationship and dynamics of the therapeutic couple in Psychedelic-Assisted Psychotherapy (PAP)",
    abstract: [
      "This workshop offers a clinical, experiential, and systemic exploration of modified states of consciousness within the context of psychedelic-assisted psychotherapy and non-pharmacological approaches such as meditation, hypnosis, and music.",
      "The workshop will also aim to help participants experience, in a supportive and safe manner, certain psychological and relational mechanisms activated in modified states of consciousness.",
    ],
    bullets: [
      "The quality of therapeutic presence",
      "Relational safety",
      "Transference dynamics in modified states of consciousness",
      "The role of setting and set and setting",
      "The modelling function of co-therapists",
      "The specificities of co-supervision by a male/female pair living as a couple",
    ],
    sharedImage: {
      src: "catherine-herve-duffour.jpg",
      alt: "Catherine Duffour and Hervé Duffour",
    },
    speakers: [
      {
        name: "Catherine Duffour",
        bio: 'Originally from South Korea and having grown up in Switzerland, Catherine Duffour is a psychiatrist, systemic therapist, and hypnotherapist. Founder of CXIO and co-founder of the Swiss Society for Psychedelic Medicine, she has been training psychiatrists in PAP since 2021 and published "Ketamine Consciousness Therapy" in 2025.',
      },
      {
        name: "Hervé Duffour",
        bio: "With 40 years' experience in personal development and medical technology, Hervé Duffour combines technical training at EPFL with business studies at HEC Lausanne. Since 2018, he has focused on personal support, therapeutic volunteering, and coaching in medical practices, adopting a holistic approach inspired by systems theory.",
      },
    ],
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
          <img
            src={withBase(`img/speakers/${speaker.image}`)}
            alt={speaker.name}
            className="aspect-[2/3] w-1/2 shrink-0 rounded-sm border border-white/10 object-cover sm:w-40"
          />
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
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-10">
              A specialized platform for Psychedelic-Assisted Therapy training, combining theoretical input
              with experiential clinical practice in four parallel language tracks.
            </p>
            <div data-fade-up className="opacity-0 flex flex-wrap justify-center gap-3">
              <a
                href="#tickets"
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
                  <div className="mt-4 flex items-center gap-3 rounded-sm border border-white/10 bg-white/5 px-4 py-3">
                    <Hourglass className="h-5 w-5 shrink-0 text-support-light" />
                    <p className="text-sm text-white/70">
                      We are currently applying for continuing education credits for medical professionals and psychologists.
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
            <div
              dangerouslySetInnerHTML={{
                __html: '<script id="etickets" src="https://infomaniak.events/scripts/shop/NWT3HX6EG2"></script>',
              }}
            />
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
