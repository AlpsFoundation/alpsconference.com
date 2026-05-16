import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

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

const TBD_COUNT = 4;

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
      <span className="text-3xl font-semibold text-white/80 tracking-wide">{speaker.initials}</span>
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      data-fade-up
      className="opacity-0 group flex flex-col bg-white/[0.03] border border-white/[0.08] rounded-sm overflow-hidden hover:border-support/30 hover:bg-white/[0.05] transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-primary/40">
        <SpeakerAvatar speaker={speaker} />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-dark/80 via-neutral-dark/10 to-transparent" />
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-5">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-support-light mb-1">{speaker.role}</p>
        <h3 className="text-lg font-semibold text-white leading-snug mb-0.5">{speaker.name}</h3>
        <p className="text-sm text-white/50 mb-4">{speaker.affiliation}</p>

        <p className="text-sm text-white/70 italic leading-relaxed mb-4 line-clamp-3">
          &ldquo;{speaker.talkTitle}&rdquo;
        </p>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-auto text-xs font-medium text-support-light hover:text-white transition-colors text-left cursor-pointer"
        >
          {expanded ? "Show less ↑" : "Read more ↓"}
        </button>

        {expanded && (
          <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40 mb-2">Abstract</p>
              <p className="text-sm text-white/65 leading-relaxed">{speaker.abstract}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40 mb-2">Biography</p>
              <p className="text-sm text-white/65 leading-relaxed">{speaker.bio}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TbdCard() {
  return (
    <div
      data-fade-up
      className="opacity-0 flex flex-col bg-white/[0.015] border border-white/[0.04] rounded-sm overflow-hidden"
    >
      <div className="relative w-full aspect-[3/4] bg-primary/20 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-xs font-medium uppercase tracking-[0.1em]">TBA</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <p className="text-xs font-medium tracking-[0.16em] uppercase text-white/20 mb-1">To be announced</p>
        <div className="h-5 w-32 bg-white/[0.04] rounded mb-1" />
        <div className="h-4 w-24 bg-white/[0.03] rounded mb-4" />
        <div className="space-y-1.5">
          <div className="h-3 w-full bg-white/[0.03] rounded" />
          <div className="h-3 w-4/5 bg-white/[0.03] rounded" />
          <div className="h-3 w-3/5 bg-white/[0.03] rounded" />
        </div>
      </div>
    </div>
  );
}

export default function Speakers() {
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
            translateY: [24, 0],
            delay: (_: unknown, i: number) => i * 80,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="speakers" className="relative py-24 sm:py-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div data-fade-up className="opacity-0 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Programme</p>
            <h2 className="text-3xl font-semibold text-white">Confirmed Speakers</h2>
            <p className="text-white/55 mt-3 text-base max-w-xl">
              Meet the researchers, clinicians, and scientists presenting at ALPS 2026. More speakers will be announced as selections are made.
            </p>
          </div>
          <a
            href={withBase("/speaker")}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white/80 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-sm transition-all duration-200"
          >
            Apply to Speak ↗
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 sm:gap-5">
          {CONFIRMED_SPEAKERS.map((speaker) => (
            <div key={speaker.name} className="col-span-1 sm:col-span-1 lg:col-span-2">
              <SpeakerCard speaker={speaker} />
            </div>
          ))}
          {Array.from({ length: TBD_COUNT }).map((_, i) => (
            <div key={`tbd-${i}`} className="col-span-1 lg:col-span-1">
              <TbdCard />
            </div>
          ))}
        </div>

        <p data-fade-up className="opacity-0 mt-10 text-center text-white/35 text-sm">
          Speaker programme updated as selections are made · Full programme announced in August 2026
        </p>
      </div>
    </section>
  );
}
