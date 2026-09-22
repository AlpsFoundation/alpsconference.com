import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import AfterpartyDiscoScene from "./AfterpartyDisco";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { registerPhotoParallax } from "../lib/photoParallax";
import {
  EXPERIENCE_MODAL_EVENT,
  getExperienceModalId,
  openExperienceModal,
} from "../lib/experienceModal";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

const AFTERPARTY_NAME = "Afterparty";
const AFTERPARTY_HASHES = new Set([`#${getExperienceModalId(AFTERPARTY_NAME)}`, "#afterparty"]);

const LINEUP = [
  { name: "Enero", genre: "Melodic Techno" },
  { name: "Psyre", genre: "Psychedelic Techno" },
  { name: "Adage", genre: "Hard Techno" },
  { name: "DK ∞", genre: "Progressive Jungle Psy" },
];

const VENUE_NAME = "Jugendkulturhaus Flösserplatz";
const VENUE = `${VENUE_NAME}, Flösserstrasse 7`;
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=AAREAL+Fl%C3%B6sserplatz%2C+Fl%C3%B6sserstrasse+7%2C+5000+Aarau";
const EVENTFROG_URL =
  "https://eventfrog.ch/de/p/partys/house-techno/afterglow-afterparty-for-the-alps-conference-guestlist-only-7505194045364252288.html";

/** The party's own artwork, panned inside its crop the way the speaker photos are. */
function AfterglowPhoto({ src, className }: { src: string; className: string }) {
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => registerPhotoParallax(photoRef.current), []);

  return <img ref={photoRef} src={src} alt="" aria-hidden="true" className={className} />;
}

function AfterpartyModal({
  open,
  onClose,
  onExited,
}: {
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const headingId = `${getExperienceModalId(AFTERPARTY_NAME)}-title`;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onCloseRef.current();
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
      className={`afterparty-modal fixed inset-0 z-50 flex items-start justify-center p-4 opacity-0${open ? "" : " pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="afterparty-modal__backdrop absolute inset-0" />
      <AfterpartyDiscoScene active={open} />
      <div
        ref={cardRef}
        className="afterparty-surface afterparty-modal__surface relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[1.25rem] shadow-2xl p-6 sm:p-8 text-white opacity-0"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center text-white/75 hover:text-white transition-colors rounded-full bg-black/35 backdrop-blur-sm hover:bg-black/55 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <img
          src={withBase("img/experiences/afterglow-banner.jpg")}
          alt="Afterglow — an SPSN afterparty for the ALPS Conference"
          className="block w-[calc(100%+3rem)] -mx-6 -mt-6 mb-6 sm:w-[calc(100%+4rem)] sm:-mx-8 sm:-mt-8 sm:mb-7 max-w-none rounded-t-[1.25rem]"
        />

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light mb-1">
          Saturday night
        </p>
        <h3 id={headingId} className="text-2xl font-semibold text-white">
          Afterparty
        </h3>
        <p className="mt-2 text-sm font-medium text-white/80">
          <span className="text-accent-light/90">Sat</span>
          <span className="text-white/30"> · </span>
          21:30–04:00
        </p>

        <p className="mt-5 text-sm text-white/80 leading-relaxed">
          The conference closes with a private afterparty — an evening of music to close the day
          together. Music starts at <span className="font-medium text-white">10 pm</span>, the
          night runs until <span className="font-medium text-white">4 am</span>.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light mb-2">
              Venue
            </p>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${VENUE} — open map in a new tab`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-white underline decoration-support-light/40 underline-offset-2 hover:decoration-support-light"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {VENUE}
            </a>
            <p className="mt-1 text-xs text-white/65">5 minutes on foot from the conference</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light mb-3">
              Lineup
            </p>
            <ul className="space-y-2.5">
              {LINEUP.map(({ name, genre }) => (
                <li key={name} className="flex items-baseline justify-between gap-3">
                  <span className="text-white font-medium">{name}</span>
                  <span className="text-white/65 text-xs shrink-0">{genre}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light mb-2">
              Tickets
            </p>
            <p className="text-sm text-white/80 leading-relaxed">
              Entry is <span className="font-medium text-white">included</span> in your
              conference ticket.
            </p>
            <p className="mt-2 text-xs text-white/65 leading-relaxed">
              The party is guestlist only — message somebody from the psychedelic community to be
              put on the guestlist, then buy a ticket on{" "}
              <a
                href={EVENTFROG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline decoration-support-light/40 underline-offset-2 hover:decoration-support-light"
              >
                eventfrog
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Afterparty() {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { present: modalPresent, onExited } = useModalPresence(modalOpen);
  const afterpartyModalId = getExperienceModalId(AFTERPARTY_NAME);

  useEffect(() => {
    const syncFromHash = () => setModalOpen(AFTERPARTY_HASHES.has(window.location.hash));
    const handleOpen = (event: Event) => {
      const { experienceId } = (event as CustomEvent<{ experienceId: string }>).detail;
      setModalOpen(experienceId === afterpartyModalId);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    };
  }, [afterpartyModalId]);

  const closeModal = () => {
    setModalOpen(false);
    if (AFTERPARTY_HASHES.has(window.location.hash)) {
      setLocationHash(null, "replace");
    }
  };

  return (
    <>
      <div className="afterparty-card col-span-2 md:col-span-1">
        <button
          ref={triggerRef}
          id="afterparty"
          type="button"
          onClick={() => openExperienceModal(AFTERPARTY_NAME)}
          className="afterparty-surface group relative flex flex-col w-full h-full text-left text-white rounded-[1.15rem] overflow-hidden border border-white/20 hover:border-white/35 transition-[border-color,filter] duration-300 cursor-pointer"
        >
          <div className="aspect-[16/10] md:aspect-square overflow-hidden relative">
            <AfterglowPhoto
              src={withBase("img/experiences/afterglow.jpg")}
              className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 group-focus-within:grayscale-0 group-hover:scale-[1.025] transition-[filter,scale] duration-700 ease-out"
            />
          </div>

          <div className="flex flex-col flex-1 p-3 sm:p-4">
            <p className="text-[0.62rem] sm:text-xs font-medium uppercase tracking-[0.14em] text-accent-light mb-1">
              Saturday night
            </p>
            <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">
              Afterparty
            </h4>

            <ul className="mt-3 space-y-1.5">
              {LINEUP.map(({ name, genre }) => (
                <li key={name} className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-white">{name}</span>
                  <span className="text-[0.68rem] text-white/65 text-right leading-snug">
                    {genre}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-3 space-y-1">
              <p className="text-[0.68rem] sm:text-xs text-white/55 leading-snug">
                <span className="text-accent-light/90">Sat</span>
                <span className="text-white/25"> · </span>
                21:30–04:00
              </p>
              <p className="text-[0.68rem] sm:text-xs text-white/55 leading-snug">
                {VENUE_NAME}
                <span className="text-white/25"> · </span>5 minutes on foot
              </p>
            </div>
          </div>
        </button>
      </div>
      {modalPresent && <AfterpartyModal open={modalOpen} onClose={closeModal} onExited={onExited} />}
    </>
  );
}
