import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import {
  getFaceCenter,
  getImageCrop,
  PANEL_SPEAKERS,
  SPEAKERS,
  type Speaker,
  type SpeakerImageCrop,
} from "../data/speakers";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { getSpeakerModalId, openSpeakerModal, SPEAKER_MODAL_EVENT } from "../lib/speakerModal";


function ModalPhoto({ src, alt, crop }: { src: string; alt: string; crop: SpeakerImageCrop }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <div className="w-16 h-16 rounded-full shrink-0 overflow-hidden border border-white/10">
      <div
        className="w-full h-full"
        style={{ transform: `scale(${crop.scale})`, transformOrigin: getFaceCenter(crop.faceBox) }}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          style={{ objectPosition: crop.position }}
          onError={() => setErrored(true)}
        />
      </div>
    </div>
  );
}

function AbstractModal({
  speaker,
  open,
  onClose,
  onExited,
}: {
  speaker: Speaker;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", handleKey);
    lockBodyScroll();
    focusWithoutScroll(closeRef.current);
    return () => {
      document.removeEventListener("keydown", handleKey);
      unlockBodyScroll();
    };
  }, []);

  useModalMotion(open, overlayRef, cardRef, onExited);

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0${open ? "" : " pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${getSpeakerModalId(speaker.name)}-title`}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-dark border border-white/10 rounded-[1.25rem] shadow-2xl p-6 sm:p-8 opacity-0"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <div className="flex items-start gap-4 mb-6">
          {speaker.image && (
            <ModalPhoto
              src={withBase(`img/speakers/${speaker.image}`)}
              alt={speaker.name}
              crop={getImageCrop(speaker.image)}
            />
          )}
          <div>
            <p className="text-sm text-support-light font-medium tracking-wide uppercase mb-1">
              {speaker.role} · {speaker.institution}
            </p>
            <h3 id={`${getSpeakerModalId(speaker.name)}-title`} className="text-xl font-semibold text-white">{speaker.name}</h3>
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
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{speaker.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function initials(name: string) {
  const parts = name.replace(/^Dr\.?\s*(phil\.?)?\s*/i, "").trim().split(" ");
  return parts.map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function SpeakerPhoto({
  src,
  alt,
  initials: init,
  crop,
}: {
  src: string;
  alt: string;
  initials: string;
  crop: SpeakerImageCrop;
}) {
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
    <div
      className="w-full h-full"
      style={{ transform: `scale(${crop.scale})`, transformOrigin: getFaceCenter(crop.faceBox) }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-focus-within:grayscale-0 group-hover:scale-[1.025] transition-[filter,scale] duration-700 ease-out"
        style={{ objectPosition: crop.position }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { present: modalPresent, onExited } = useModalPresence(modalOpen);
  const speakerModalId = getSpeakerModalId(speaker.name);

  useEffect(() => {
    const syncFromHash = () => setModalOpen(window.location.hash === `#${speakerModalId}`);
    const handleOpen = (event: Event) => {
      const { speakerId } = (event as CustomEvent<{ speakerId: string }>).detail;
      setModalOpen(speakerId === speakerModalId);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener(SPEAKER_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener(SPEAKER_MODAL_EVENT, handleOpen);
    };
  }, [speakerModalId]);

  const closeModal = () => {
    setModalOpen(false);
    if (window.location.hash === `#${speakerModalId}`) {
      setLocationHash(null, "replace");
    }
  };

  return (
    <>
      <div
        data-fade-up
        className="opacity-0 group relative flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-[1.25rem] overflow-hidden hover:border-support/30 hover:bg-white/[0.05] transition-all duration-300"
      >
        <div className="aspect-[4/5] overflow-hidden bg-white/[0.03] relative">
          {speaker.image ? (
            <SpeakerPhoto
              src={withBase(`img/speakers/${speaker.image}`)}
              alt={speaker.name}
              initials={initials(speaker.name)}
              crop={getImageCrop(speaker.image)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-support/20 border border-support/30 flex items-center justify-center">
                <span className="text-xl text-support-light font-bold">{initials(speaker.name)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-3 sm:p-4 lg:p-5">
          <p className="text-[0.62rem] sm:text-xs font-medium uppercase tracking-[0.14em] sm:tracking-[0.16em] text-support-light mb-1">
            {speaker.role}
          </p>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 leading-snug">{speaker.name}</h3>
          <p className="text-xs sm:text-sm text-white/50 mb-3 sm:mb-4 leading-snug">{speaker.institution}</p>

          <div className="mt-auto pt-3 sm:pt-4 border-t border-white/[0.06]">
            {speaker.talkTitle && (
              <p className="text-sm sm:text-base text-white/80 line-clamp-4 sm:line-clamp-3 leading-relaxed mb-3">
                {speaker.talkTitle}
              </p>
            )}
            {(speaker.abstract || speaker.bio) && (
              <button
                onClick={() => openSpeakerModal(speaker.name)}
                className="text-[0.68rem] sm:text-xs font-medium text-support-light hover:text-white transition-colors uppercase tracking-[0.12em] sm:tracking-[0.14em] cursor-pointer"
              >
                Read abstract →
              </button>
            )}
          </div>
        </div>
      </div>

      {modalPresent && (
        <AbstractModal speaker={speaker} open={modalOpen} onClose={closeModal} onExited={onExited} />
      )}
    </>
  );
}

function TbdCard() {
  return (
    <div
      data-fade-up
      className="opacity-0 relative flex flex-col bg-white/[0.01] border border-white/[0.04] rounded-[1.25rem] overflow-hidden"
    >
      <div className="aspect-[4/5] bg-white/[0.02] flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center">
          <span className="text-white/20 text-2xl">?</span>
        </div>
      </div>
      <div className="flex flex-col flex-1 p-3 sm:p-4 lg:p-5">
        <p className="text-[0.62rem] sm:text-xs font-medium uppercase tracking-[0.14em] sm:tracking-[0.16em] text-white/20 mb-1">
          Speaker
        </p>
        <h3 className="text-base sm:text-lg font-semibold text-white/25 mb-0.5">To Be Announced</h3>
        <p className="text-xs sm:text-sm text-white/20">More speakers coming soon</p>
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
            translateY: [18, 0],
            delay: (_: unknown, i: number) => i * 60,
            duration: 620,
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
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">
            ALPS 2026
          </p>
          <h2 className="section-title mb-4">Confirmed speakers</h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Distinguished researchers and clinicians presenting at the forefront of psychedelic science.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {SPEAKERS.map((entry, i) =>
            "tbd" in entry && entry.tbd ? (
              <TbdCard key={`tbd-${i}`} />
            ) : (
              <SpeakerCard key={(entry as Speaker).name} speaker={entry as Speaker} />
            )
          )}
        </div>

        <div data-fade-up className="opacity-0 mt-14 sm:mt-16 mb-10 sm:mb-12 text-center">
          <p className="section-eyebrow">
            ALPS 2026
          </p>
          <h2 className="section-title mb-4">Panel</h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">
            Panel title to be announced. Further panel speakers will be uploaded soon.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {PANEL_SPEAKERS.map((entry, i) =>
            "tbd" in entry && entry.tbd ? (
              <TbdCard key={`panel-tbd-${i}`} />
            ) : (
              <SpeakerCard key={(entry as Speaker).name} speaker={entry as Speaker} />
            )
          )}
        </div>
      </div>
    </section>
  );
}
