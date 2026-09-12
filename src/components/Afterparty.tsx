import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import { setLocationHash } from "../lib/locationHash";
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

const VENUE = "Jugendkulturhaus, Flösserstrasse 7";
const MAP_URL =
  "https://www.google.com/maps/search/?api=1&query=Jugendkulturhaus%2C+Fl%C3%B6sserstrasse+7%2C+Aarau";
const EVENTFROG_URL = "https://eventfrog.ch";

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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0${open ? "" : " pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        ref={cardRef}
        className="afterparty-surface relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-[1.25rem] shadow-2xl p-6 sm:p-8 text-neutral-dark opacity-0"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-neutral-dark/45 hover:text-neutral-dark transition-colors rounded-sm hover:bg-neutral-dark/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-dark/55 mb-1">
          Saturday night
        </p>
        <h3 id={headingId} className="text-2xl font-semibold text-neutral-dark">
          Afterparty
        </h3>
        <p className="mt-2 text-sm font-medium text-neutral-dark/75">21:30–04:00</p>

        <p className="mt-5 text-sm text-neutral-dark/75 leading-relaxed">
          The conference closes with a private afterparty — an evening of music to close the day
          together. Doors open at <span className="font-medium text-neutral-dark">10 pm</span>, the
          night runs until <span className="font-medium text-neutral-dark">4 am</span>.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-dark/50 mb-2">
              Venue
            </p>
            <a
              href={MAP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${VENUE} — open map in a new tab`}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-dark underline decoration-neutral-dark/25 underline-offset-2 hover:decoration-neutral-dark/60"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {VENUE}
            </a>
            <p className="mt-1 text-xs text-neutral-dark/55">5 minutes on foot from the conference</p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-dark/50 mb-3">
              Lineup
            </p>
            <ul className="space-y-2.5">
              {LINEUP.map(({ name, genre }) => (
                <li key={name} className="flex items-baseline justify-between gap-3">
                  <span className="text-neutral-dark font-medium">{name}</span>
                  <span className="text-neutral-dark/50 text-xs shrink-0">{genre}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-dark/50 mb-2">
              Tickets
            </p>
            <p className="text-sm text-neutral-dark/75 leading-relaxed">
              Entry is <span className="font-medium text-neutral-dark">included</span> in your
              conference ticket.
            </p>
            <p className="mt-2 text-xs text-neutral-dark/55 leading-relaxed">
              ALPS & SPSN Friends &amp; Family can purchase a separate ticket via{" "}
              <a
                href={EVENTFROG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-neutral-dark underline decoration-neutral-dark/25 underline-offset-2 hover:decoration-neutral-dark/60"
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
      <button
        id="afterparty"
        type="button"
        onClick={() => openExperienceModal(AFTERPARTY_NAME)}
        className="afterparty-surface group relative flex flex-col sm:flex-row lg:flex-col w-full h-full col-span-2 lg:col-span-1 text-left text-neutral-dark rounded-[1.15rem] overflow-hidden border border-white/20 hover:border-white/35 transition-[border-color,filter] duration-300 cursor-pointer p-4 sm:p-5"
      >
        <div className="min-w-0">
          <p className="text-[0.62rem] sm:text-xs font-semibold uppercase tracking-[0.14em] text-neutral-dark/55 mb-1">
            Saturday night
          </p>
          <h4 className="text-[1.65rem] sm:text-[1.85rem] font-semibold text-neutral-dark leading-none tracking-tight">
            Afterparty
          </h4>

          <div className="mt-4 space-y-1.5">
            <p className="text-sm font-medium text-neutral-dark">21:30–04:00</p>
            <p className="text-sm text-neutral-dark/70 leading-snug">{VENUE}</p>
            <p className="text-xs text-neutral-dark/50">5 minutes on foot</p>
          </div>
        </div>

        <div className="mt-5 sm:mt-0 sm:ml-auto sm:min-w-[13rem] sm:pl-6 lg:ml-0 lg:mt-auto lg:pt-5 lg:pl-0 lg:min-w-0 lg:w-full">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-neutral-dark/45 mb-2.5">
            Lineup
          </p>
          <ul className="space-y-1.5">
            {LINEUP.map(({ name, genre }) => (
              <li key={name} className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-neutral-dark">{name}</span>
                <span className="text-[0.68rem] text-neutral-dark/50 text-right leading-snug">
                  {genre}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </button>
      {modalPresent && <AfterpartyModal open={modalOpen} onClose={closeModal} onExited={onExited} />}
    </>
  );
}
