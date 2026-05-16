import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

type Speaker = {
  name: string;
  role: string;
  affiliation: string;
  talkTitle: string;
  abstract: string;
  bio: string;
  photo: string;
  initials: string;
};

const CONFIRMED_SPEAKERS: Speaker[] = [
  {
    name: "Dr. Max Wolff",
    role: "Clinician-Scientist",
    affiliation: "Humboldt-Universität zu Berlin",
    talkTitle: "The Role of Experiential Avoidance and Acceptance in Psilocybin Therapy for Depression",
    abstract:
      "Quantitative and qualitative findings from clinical studies suggest that the effectiveness of psychedelic therapies is linked to the reduction of dysfunctional avoidance tendencies and the promotion of acceptance toward unpleasant emotions such as fear, grief, and anger. But how can these effects be explained? From a psychotherapeutic perspective, it seems plausible that psychedelic experiences can under favorable circumstances initiate learning processes that reduce avoidance and promote acceptance. Conversely, it is also conceivable that under unfavorable conditions the opposite occurs and avoidance tendencies are reinforced. The EPIsoDE trial (a phase 2b trial testing psilocybin therapy in 144 depression patients), is the first clinical study that quantified avoidance- and acceptance-related experiences during psychedelic dosing sessions and examined their relationship to treatment outcomes. This talk presents the findings, situates them within a theoretical framework, and discusses implications for research and clinical practice.",
    bio: "Max Wolff is a psychologist, psychotherapist and clinician-scientist at Humboldt-Universität zu Berlin, Germany. His research bridges psychedelic and psychotherapy research and explores psychological change processes associated with altered states of consciousness. He has contributed as a researcher and therapist to several clinical trials in the field and is committed to advancing professional training programs such as the MIND Foundation's Augmented Psychotherapy Training (APT), which he directed until 2025, and the OPEN Foundation's Advanced Education in Psychedelic Therapy (ADEPT) whose self-experience curriculum he supports.",
    photo: "max-wolff.jpg",
    initials: "MW",
  },
  {
    name: "Dr. Lydia Belinger",
    role: "Postdoc",
    affiliation: "University of Zurich, Switzerland",
    talkTitle:
      "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate",
    abstract:
      "Changes in social cognition are discussed as a potential mechanism of action underlying the therapeutic effects of psychedelics and MDMA, which is particularly relevant given the central role of impaired social functioning in various psychiatric disorders. Both psilocybin and MDMA have shown to acutely influence social perception and behavior, with the serotonin (5-hydroxytryptamine, 5-HT) system playing an important role in these effects. However, little is known about whether such changes persist beyond the acute phase or how they differ across pharmacological compounds. This talk will present findings from a comparative study investigating the sustained effects of psilocybin and MDMA in comparison with the non-serotonergic active control compound methylphenidate across multiple domains of social cognition, highlighting differential, time-dependent effects across substances and social cognitive processes.",
    bio: "Lydia Belinger studied psychology with a focus on neuropsychology and neuroscience at the University of Zurich, Switzerland. During her PhD and subsequent postdoctoral research, she investigates the sustained effects of psychedelics and MDMA on prosocial behavior. She is affiliated with the research groups Addictive Disorders (PD Dr. M. Herdener) and Pharmaco-Neuroimaging and Cognitive-Emotional Processing (PD Dr. K. Preller) at the Department of Adult Psychiatry and Psychotherapy, University Hospital of Psychiatry Zurich and the University of Zurich.",
    photo: "lydia-belinger.jpg",
    initials: "LB",
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
            delay: (_: unknown, i: number) => i * 90,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

function SpeakerAvatar({ speaker }: { speaker: Speaker }) {
  const [imgError, setImgError] = useState(false);
  const src = withBase(`img/speakers/${speaker.photo}`);
  if (!imgError) {
    return (
      <img
        src={src}
        alt={speaker.name}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-support/30 to-primary-light/20">
      <span className="text-5xl font-semibold text-white/70 tracking-wide">{speaker.initials}</span>
    </div>
  );
}

function SpeakerDetail({ speaker }: { speaker: Speaker }) {
  return (
    <article
      data-fade-up
      className="opacity-0 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 bg-white/[0.03] border border-white/[0.08] rounded-sm overflow-hidden"
    >
      {/* Photo column */}
      <div className="relative aspect-[3/4] md:aspect-auto md:h-full min-h-[280px] bg-primary/40 overflow-hidden">
        <SpeakerAvatar speaker={speaker} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/60 via-neutral-dark/5 to-transparent md:bg-gradient-to-r" />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:hidden">
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-support-light mb-1">{speaker.role}</p>
          <h3 className="text-xl font-semibold text-white">{speaker.name}</h3>
          <p className="text-sm text-white/60">{speaker.affiliation}</p>
        </div>
      </div>

      {/* Content column */}
      <div className="p-6 sm:p-8 flex flex-col gap-6">
        <div className="hidden md:block">
          <p className="text-xs font-medium tracking-[0.16em] uppercase text-support-light mb-2">{speaker.role}</p>
          <h3 className="text-2xl font-semibold text-white mb-1">{speaker.name}</h3>
          <p className="text-base text-white/55">{speaker.affiliation}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35 mb-3">Talk</p>
          <p className="text-lg sm:text-xl font-medium text-white/90 leading-snug italic">
            &ldquo;{speaker.talkTitle}&rdquo;
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35 mb-3">Abstract</p>
          <p className="text-base text-white/70 leading-relaxed">{speaker.abstract}</p>
        </div>

        <div className="border-t border-white/[0.06] pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/35 mb-3">Biography</p>
          <p className="text-base text-white/65 leading-relaxed">{speaker.bio}</p>
        </div>
      </div>
    </article>
  );
}

function TbdCard() {
  return (
    <div
      data-fade-up
      className="opacity-0 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 bg-white/[0.015] border border-white/[0.04] rounded-sm overflow-hidden"
    >
      <div className="relative aspect-[3/4] md:aspect-auto md:h-full min-h-[160px] bg-primary/15 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
            <span className="text-white/20 text-xs font-medium uppercase tracking-[0.1em]">TBA</span>
          </div>
        </div>
      </div>
      <div className="p-6 sm:p-8 flex flex-col justify-center gap-4">
        <div>
          <div className="h-3 w-20 bg-white/[0.04] rounded mb-3" />
          <div className="h-6 w-48 bg-white/[0.04] rounded mb-1" />
          <div className="h-4 w-36 bg-white/[0.03] rounded" />
        </div>
        <div>
          <div className="h-3 w-16 bg-white/[0.03] rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-white/[0.03] rounded" />
            <div className="h-4 w-4/5 bg-white/[0.03] rounded" />
          </div>
        </div>
        <p className="text-sm text-white/25 italic">Speaker to be announced · More selections in August 2026</p>
      </div>
    </div>
  );
}

export default function SpeakersPage() {
  const heroRef = useRef<HTMLElement>(null);
  const speakersRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useScrollFade(heroRef);
  useScrollFade(speakersRef);
  useScrollFade(ctaRef);

  return (
    <>
      <Navbar />

      <main>
        {/* Hero */}
        <section ref={heroRef} className="relative pt-40 pb-20 sm:pt-48 sm:pb-28 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div data-fade-up className="opacity-0 mb-8 flex justify-center">
              <img src={withBase("img/logo.png")} alt="ALPS Research Conference" className="h-16 sm:h-20 w-auto" />
            </div>
            <p data-fade-up className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4">
              ALPS Conference 2026 · 9–10 October, Aarau
            </p>
            <h1 data-fade-up className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              Speakers
            </h1>
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Meet the researchers, clinicians, and scientists presenting at ALPS 2026. Speakers are selected
              by the programme committee and announced on a rolling basis.
            </p>
          </div>
        </section>

        {/* Confirmed speakers */}
        <section ref={speakersRef} className="relative py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-12">
              <p className="text-sm tracking-[0.2em] uppercase text-support-light font-medium mb-3">Confirmed</p>
              <h2 className="text-3xl font-semibold text-white">Programme</h2>
            </div>

            <div className="space-y-8">
              {CONFIRMED_SPEAKERS.map((speaker) => (
                <SpeakerDetail key={speaker.name} speaker={speaker} />
              ))}

              {[1, 2, 3].map((i) => (
                <TbdCard key={`tbd-${i}`} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section ref={ctaRef} className="relative py-20 sm:py-28 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div data-fade-up className="opacity-0">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Open until 30 June 2026</p>
              <h2 className="text-3xl font-semibold text-white mb-4">Want to Present at ALPS 2026?</h2>
              <p className="text-white/60 text-base max-w-xl mx-auto mb-8">
                We invite PhD candidates, clinicians, and researchers to apply as speakers. Talks are 45 minutes plus Q&amp;A.
              </p>
              <a
                href={withBase("/speaker")}
                className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
              >
                Apply to Speak ↗
              </a>
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
