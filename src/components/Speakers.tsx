import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";

type Speaker = {
  name: string;
  title: string;
  institution: string;
  role: string;
  talkTitle: string;
  abstract: string;
  bio: string;
  image?: string;
  tbd?: false;
};

type TbdSpeaker = {
  tbd: true;
};

type SpeakerEntry = Speaker | TbdSpeaker;

const SPEAKERS: SpeakerEntry[] = [
  { tbd: true },
  { tbd: true },
  { tbd: true },
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Talk</p>
            <p className="text-base font-medium text-white/90 leading-snug">{speaker.talkTitle}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Abstract</p>
            <p className="text-sm text-white/70 leading-relaxed">{speaker.abstract}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-support-light/70 mb-2">Biography</p>
            <p className="text-sm text-white/70 leading-relaxed">{speaker.bio}</p>
          </div>
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
      className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500"
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
            <p className="text-base text-white/80 line-clamp-3 leading-relaxed mb-3">
              {speaker.talkTitle}
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-medium text-support-light hover:text-white transition-colors uppercase tracking-[0.14em] cursor-pointer"
            >
              Read abstract →
            </button>
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
            More speakers will be announced as confirmations are received.{" "}
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
