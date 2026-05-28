import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { ChevronDown, ChevronUp } from "lucide-react";

type Speaker = {
  name: string;
  institution: string;
  role: string;
  talkTitle: string;
  abstract: string;
  bio: string;
};

const SPEAKERS: Speaker[] = [
  {
    name: "Tommaso Barba",
    institution: "Imperial College London",
    role: "PhD Candidate",
    talkTitle: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT",
    abstract: `5-MeO-DMT (5MeO) is a short-acting psychedelic compound reported to induce profound alterations in consciousness by disrupting the experience of self, time and space, at times leading to experiences akin to 'pure awareness'. However, there are no controlled human neuroimaging studies characterizing its effects on brain dynamics, and relationship to consciousness.

We hypothesized that 5-MeO-DMT would induce marked reductions in the power of alpha/beta brain oscillations, and increases in delta power and neural entropy. Importantly we hypothesised reductions in alpha power and increases in neural entropy to correlate with self-dissolution. We also explored the effects of 5MeO on post-acute psychological outcomes.

Thirty-six healthy volunteers completed a controlled within-subject study, receiving placebo and 12mg intranasal 5MeO on separate visits. High-density (hd) EEG and real-time ratings of self-dissolution were collected. We assessed changes in oscillatory power (also controlling for 1/f confounds), and neural entropy (determined with Lempel-Ziv complexity) relative to baseline for each session. Cluster-based permutation tests were used for 5MeO v placebo contrasts, and time-resolved correlations linked neural measures to subjective ratings. Source localisation mapped the spatial distribution of effects. Linear mixed models assessed pre-post psychological changes following 5-MeO-DMT.

At peak effects (8–14 minutes post-administration), 5MeO increased delta/gamma power (both p<0.0001) and reduced theta, alpha, and beta power (all p<0.001) when compared to placebo. Neural entropy was also significantly increased (p<0.0001). Time-resolved correlations showed significant correlations between scores of (narrative and bodily) self-dissolution and void experiences and higher delta/gamma, and lower theta/alpha/beta power (all p<0.001). Follow-up measures indicated significantly reduced anxiety and increased connectedness.

This study provides the first controlled neural evidence of 5-MeO-DMT in humans, linking real-time experiences of self-dissolution with neural signatures and supporting models of psychedelics as transient disruptors of self-related neural processes. These findings pave the way for further research into the use of 5MeO to enhance the understanding of the sense of self and consciousness.`,
    bio: "Tommaso Barba is a PhD researcher at the Centre for Psychedelic Research, Imperial College London, where his work focuses on the neuroscience and therapeutic potential of psychedelic compounds. His research investigates the effects of substances such as DMT and 5-MeO-DMT on brain function, consciousness, mental health, and interpersonal processes, with a particular interest in mechanisms underlying well-being and transformative experiences. He has contributed to research published in leading scientific journals including Nature Medicine and The Lancet. Alongside his academic work, he is involved in science communication and public engagement around mental health, neuroscience, and emerging psychiatric treatments.",
  },
];

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [abstractOpen, setAbstractOpen] = useState(false);
  const [bioOpen, setBioOpen] = useState(false);

  const initials = speaker.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <article
      data-fade-up
      className="opacity-0 rounded-sm border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8"
    >
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar placeholder */}
        <div className="shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-sm bg-support/15 border border-support/20 flex items-center justify-center">
            <span className="text-2xl font-semibold text-support-light">{initials}</span>
          </div>
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-support-light">
              {speaker.role}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-xs text-white/55">{speaker.institution}</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">{speaker.name}</h3>
          <p className="text-base text-white/60 italic leading-snug">"{speaker.talkTitle}"</p>
        </div>
      </div>

      {/* Expandable sections */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => setAbstractOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-sm border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-left text-sm font-medium text-white/70 hover:text-white hover:border-white/15 transition-colors duration-200"
        >
          <span>Read Abstract</span>
          {abstractOpen ? (
            <ChevronUp className="w-4 h-4 shrink-0 text-support-light" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 text-support-light" />
          )}
        </button>
        {abstractOpen && (
          <div className="px-4 pb-2 space-y-3 text-sm text-white/65 leading-relaxed">
            {speaker.abstract.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        )}

        <button
          onClick={() => setBioOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 rounded-sm border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-left text-sm font-medium text-white/70 hover:text-white hover:border-white/15 transition-colors duration-200"
        >
          <span>About the Speaker</span>
          {bioOpen ? (
            <ChevronUp className="w-4 h-4 shrink-0 text-support-light" />
          ) : (
            <ChevronDown className="w-4 h-4 shrink-0 text-support-light" />
          )}
        </button>
        {bioOpen && (
          <div className="px-4 pb-2 text-sm text-white/65 leading-relaxed">
            <p>{speaker.bio}</p>
          </div>
        )}
      </div>
    </article>
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
            translateY: [30, 0],
            delay: (_: unknown, i: number) => i * 120,
            duration: 800,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="speakers" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Confirmed Speakers
          </p>
          <h2 className="text-3xl font-semibold text-white">Meet the Speakers</h2>
        </div>

        <div className="space-y-6">
          {SPEAKERS.map((speaker) => (
            <SpeakerCard key={speaker.name} speaker={speaker} />
          ))}
        </div>
      </div>
    </section>
  );
}
