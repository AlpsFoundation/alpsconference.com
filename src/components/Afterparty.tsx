import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";
import AfterpartyDisco, { AfterpartyDiscoScene } from "./AfterpartyDisco";
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
      className={`afterparty-modal fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0${open ? "" : " pointer-events-none"}`}
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
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/65 hover:text-white transition-colors rounded-sm hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>

        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light mb-1">
          Saturday night
        </p>
        <h3 id={headingId} className="text-2xl font-semibold text-white">
          Afterparty
        </h3>
        <p className="mt-2 text-sm font-medium text-white/80">21:30–04:00</p>

        <p className="mt-5 text-sm text-white/80 leading-relaxed">
          The conference closes with a private afterparty — an evening of music to close the day
          together. Doors open at <span className="font-medium text-white">10 pm</span>, the
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
              ALPS & SPSN Friends &amp; Family can purchase a separate ticket via{" "}
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
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const { present: modalPresent, onExited } = useModalPresence(modalOpen);
  const afterpartyModalId = getExperienceModalId(AFTERPARTY_NAME);
  const cardSpinning = (hovered || focused) && !modalPresent;

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
          onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
          onPointerDown={(event) => { if (event.pointerType === "touch") setHovered(true); }}
          onPointerUp={() => setHovered(false)}
          onPointerCancel={() => setHovered(false)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="afterparty-surface group relative flex flex-col w-full h-full text-left text-white rounded-[1.15rem] overflow-hidden border border-white/20 hover:border-white/35 transition-[border-color,filter] duration-300 cursor-pointer p-4 sm:p-5"
        >
          <AfterpartyDisco spinning={cardSpinning} placement="card" />

          <div className="afterparty-card__copy min-w-0">
            <p className="text-[0.62rem] sm:text-xs font-semibold uppercase tracking-[0.14em] text-accent-light/90 mb-1">
              Saturday night
            </p>
            <h4 className="text-[1.65rem] sm:text-[1.85rem] font-semibold text-white leading-none tracking-tight">
              Afterparty
            </h4>

            <div className="mt-4 space-y-1.5">
              <p className="text-sm font-medium text-white">21:30–04:00</p>
              <p className="text-sm text-white/75 leading-snug">{VENUE}</p>
              <p className="text-xs text-white/65">5 minutes on foot</p>
            </div>
          </div>

          <div className="mt-auto pt-4 w-full">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-accent-light/80 mb-2.5">
              Lineup
            </p>
            <ul className="space-y-1.5">
              {LINEUP.map(({ name, genre }) => (
                <li key={name} className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium text-white">{name}</span>
                  <span className="text-[0.68rem] text-white/65 text-right leading-snug">
                    {genre}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </button>
      </div>
      {modalPresent && <AfterpartyModal open={modalOpen} onClose={closeModal} onExited={onExited} />}
    </>
  );
}
