import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

type Speaker = {
  name: string;
  title: string;
  institution: string;
  role: string;
  talkTitle?: string;
  abstract?: string;
  bio?: string;
  image?: string;
  tbd?: false;
};

type TbdSpeaker = {
  tbd: true;
};

type SpeakerEntry = Speaker | TbdSpeaker;

const SPEAKERS: SpeakerEntry[] = [
  {
    name: "Dr. Max Wolff",
    title: "Dr.",
    institution: "Humboldt University of Berlin, Germany",
    role: "Clinician-Scientist",
    image: "max-wolff.jpg",
    talkTitle: "The Role of Experiential Avoidance and Acceptance in Psilocybin Therapy for Depression",
    abstract:
      "Quantitative and qualitative findings from clinical studies suggest that the effectiveness of psychedelic therapies is linked to the reduction of dysfunctional avoidance tendencies and the promotion of acceptance toward unpleasant emotions such as fear, grief, and anger. But how can these effects be explained? From a psychotherapeutic perspective, it seems plausible that psychedelic experiences can under favorable circumstances initiate learning processes that reduce avoidance and promote acceptance. Conversely, it is also conceivable that under unfavorable conditions the opposite occurs and avoidance tendencies are reinforced. The EPIsoDE trial (a phase 2b trial testing psilocybin therapy in 144 depression patients), is the first clinical study that quantified avoidance- and acceptance-related experiences during psychedelic dosing sessions and examined their relationship to treatment outcomes. This talk presents the findings, situates them within a theoretical framework, and discusses implications for research and clinical practice.",
    bio: "Max Wolff is a psychologist, psychotherapist and clinician-scientist at Humboldt-Universität zu Berlin, Germany. His research bridges psychedelic and psychotherapy research and explores psychological change processes associated with altered states of consciousness. He has contributed as a researcher and therapist to several clinical trials in the field and is committed to advancing professional training programs such as the MIND Foundation's Augmented Psychotherapy Training (APT), which he directed until 2025, and the OPEN Foundation's Advanced Education in Psychedelic Therapy (ADEPT) whose self-experience curriculum he supports.",
  },
  {
    name: "Dr. Lydia Belinger",
    title: "Dr. phil.",
    institution: "University of Zurich, Switzerland",
    role: "Postdoc",
    image: "lydia-belinger.jpg",
    talkTitle: "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate",
    abstract:
      "Changes in social cognition are discussed as a potential mechanism of action underlying the therapeutic effects of psychedelics and MDMA, which is particularly relevant given the central role of impaired social functioning in various psychiatric disorders. Both psilocybin and MDMA have shown to acutely influence social perception and behavior, with the serotonin (5-hydroxytryptamine, 5-HT) system playing an important role in these effects. However, little is known about whether such changes persist beyond the acute phase or how they differ across pharmacological compounds. This talk will present findings from a comparative study investigating the sustained effects of psilocybin and MDMA in comparison with the non-serotonergic active control compound methylphenidate across multiple domains of social cognition, highlighting differential, time-dependent effects across substances and social cognitive processes.",
    bio: "Lydia Belinger studied psychology with a focus on neuropsychology and neuroscience at the University of Zurich, Switzerland. During her PhD and subsequent postdoctoral research, she investigates the sustained effects of psychedelics and MDMA on prosocial behavior. She is affiliated with the research groups Addictive Disorders (PD Dr. M. Herdener) and Pharmaco-Neuroimaging and Cognitive-Emotional Processing (PD Dr. K. Preller) at the Department of Adult Psychiatry and Psychotherapy, University Hospital of Psychiatry Zurich and the University of Zurich.",
  },
  {
    name: "Tommaso Barba",
    title: "",
    institution: "Imperial College London",
    role: "PhD Candidate",
    image: "Tommaso-Barba.jpg",
    talkTitle: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT",
    abstract:
      "Background\n\n5-MeO-DMT (5MeO) is a short-acting psychedelic compound reported to induce profound alterations in consciousness by disrupting the experience of self, time and space, at times leading to experiences akin to 'pure awareness'. However, there are no controlled human neuroimaging studies characterizing its effects on brain dynamics, and relationship to consciousness.\n\nHypotheses\n\nWe hypothesized that 5-MeO-DMT would induce marked reductions in the power of alpha/beta brain oscillations, and increases in delta power and neural entropy. Importantly we hypothesised reductions in alpha power and increases in neural entropy to correlate with self-dissolution. We also explored the effects of 5MeO on post-acute psychological outcomes.\n\nMethods\n\nThirty-six healthy volunteers completed a controlled within-subject study, receiving placebo and 12mg intranasal 5MeO on separate visits. High-density (hd) EEG and real-time ratings of self-dissolution were collected. We assessed changes in oscillatory power (also controlling for 1/f confounds), and neural entropy (determined with Lempel-Ziv complexity) relative to baseline for each session. Cluster-based permutation tests were used for 5MeO v placebo contrasts, and time-resolved correlations linked neural measures to subjective ratings. Source localisation mapped the spatial distribution of effects. Linear mixed models assessed pre-post psychological changes following 5-MeO-DMT.\n\nFindings\n\nAt peak effects (8–14 minutes post-administration), 5MeO increased delta/gamma power (both p<0.0001) and reduced theta, alpha, and beta power (all p<0.001) when compared to placebo. Neural entropy was also significantly increased (p<0.0001). Time-resolved correlations showed significant correlations between scores of (narrative and bodily) self-dissolution and void experiences and higher delta/gamma, and lower theta/alpha/beta power (all p<0.001). Follow-up measures indicated significantly reduced anxiety and increased connectedness.\n\nConclusions\n\nThis study provides the first controlled neural evidence of 5-MeO-DMT in humans, linking real-time experiences of self-dissolution with neural signatures and supporting models of psychedelics as transient disruptors of self-related neural processes. These findings pave the way for further research into the use of 5MeO to enhance the understanding of the sense of self and consciousness.",
    bio: "Tommaso Barba is a PhD researcher at the Centre for Psychedelic Research, Imperial College London, where his work focuses on the neuroscience and therapeutic potential of psychedelic compounds. His research investigates the effects of substances such as DMT and 5-MeO-DMT on brain function, consciousness, mental health, and interpersonal processes, with a particular interest in mechanisms underlying well-being and transformative experiences. He has contributed to research published in leading scientific journals including Nature Medicine and The Lancet. Alongside his academic work, he is involved in science communication and public engagement around mental health, neuroscience, and emerging psychiatric treatments.",
  },
  {
    name: "Prof. Dr. Eric Vermetten",
    title: "MD, PhD",
    institution: "Leiden University Medical Center",
    role: "Professor of Psychiatry",
    image: "eric-vermetten.jpg",
  },
  { tbd: true },
  { tbd: true },
  { tbd: true },
  { tbd: true },
];

function ModalPhoto({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <img
      src={src}
      alt={alt}
      className="w-16 h-16 rounded-full object-cover shrink-0 border border-white/10"
      onError={() => setErrored(true)}
    />
  );
}

function AbstractModal({
  speaker,
  onClose,
}: {
  speaker: Speaker;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-dark border border-white/10 rounded-sm shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-start gap-4 mb-6">
          {speaker.image && (
            <ModalPhoto src={withBase(`img/speakers/${speaker.image}`)} alt={speaker.name} />
          )}
          <div>
            <p className="text-sm text-support-light font-medium tracking-wide uppercase mb-1">
              {speaker.role} · {speaker.institution}
            </p>
            <h3 className="text-xl font-semibold text-white">{speaker.name}</h3>
          </div>
        </div>

        <div className="space-y-5">
          {speaker.talkTitle && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Talk</p>
              <p className="text-base font-medium text-white/90 leading-snug">{speaker.talkTitle}</p>
            </div>
          )}
          {speaker.abstract && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Abstract</p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{speaker.abstract}</p>
            </div>
          )}
          {speaker.bio && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Biography</p>
              <p className="text-sm text-white/70 leading-relaxed">{speaker.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s*(phil\.?)?\s*/i, "").trim().split(" ");
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function SpeakerPhoto({ src, alt, initials: init }: { src: string; alt: string; initials: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-support/20 border border-support/30 flex items-center justify-center">
          <span className="text-xl text-support-light font-bold">{init}</span>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
      onError={() => setErrored(true)}
    />
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        data-fade-up
        className="opacity-0 group relative flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-sm overflow-hidden hover:border-support/30 hover:bg-white/[0.05] transition-all duration-300"
      >
        <div className="aspect-[4/3] overflow-hidden bg-white/[0.03] relative">
          {speaker.image ? (
            <SpeakerPhoto src={withBase(`img/speakers/${speaker.image}`)} alt={speaker.name} initials={initials(speaker.name)} />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-support/20 border border-support/30 flex items-center justify-center">
                <span className="text-xl text-support-light font-bold">{initials(speaker.name)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-support-light mb-1">
            {speaker.role}
          </p>
          <h3 className="text-lg font-semibold text-white mb-0.5">{speaker.name}</h3>
          <p className="text-sm text-white/50 mb-4">{speaker.institution}</p>

          <div className="mt-auto pt-4 border-t border-white/[0.06]">
            {speaker.talkTitle ? (
              <p className="text-base text-white/80 line-clamp-3 leading-relaxed mb-3">
                {speaker.talkTitle}
              </p>
            ) : (
              <p className="text-sm text-white/30 italic mb-3">To be announced</p>
            )}
            {(speaker.abstract || speaker.bio) && (
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-medium text-support-light hover:text-white transition-colors uppercase tracking-[0.14em] cursor-pointer"
              >
                Read abstract →
              </button>
            )}
          </div>
        </div>
      </div>

      {modalOpen && <AbstractModal speaker={speaker} onClose={() => setModalOpen(false)} />}
    </>
  );
}

function TbdCard() {
  return (
    <div
      data-fade-up
      className="opacity-0 relative flex flex-col bg-white/[0.01] border border-white/[0.04] rounded-sm overflow-hidden"
    >
      <div className="aspect-[4/3] bg-white/[0.02] flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-2xl">?</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/20 mb-1">
          Speaker
        </p>
        <h3 className="text-lg font-semibold text-white/25 mb-0.5">To Be Announced</h3>
        <p className="text-sm text-white/20">More speakers coming soon</p>
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
        <div data-fade-up className="opacity-0 text-center mb-14">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            ALPS 2026
          </p>
          <h2 className="text-3xl font-semibold text-white mb-4">Confirmed Speakers</h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Distinguished researchers and clinicians presenting at the forefront of psychedelic science.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SPEAKERS.map((entry, i) =>
            "tbd" in entry && entry.tbd ? (
              <TbdCard key={`tbd-${i}`} />
            ) : (
              <SpeakerCard key={(entry as Speaker).name} speaker={entry as Speaker} />
            )
          )}
        </div>

        <div data-fade-up className="opacity-0 mt-12 text-center">
          <p className="text-white/40 text-sm">
            More speakers will be announced soon. Want to be part of this year conference?{" "}
            <a
              href={withBase("/speaker")}
              className="text-support-light hover:text-white transition-colors underline underline-offset-2"
            >
              Apply to speak →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
