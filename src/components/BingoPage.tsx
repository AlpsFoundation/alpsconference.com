import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Check, Info, LockKeyhole, RotateCcw, Shuffle, Trash2, X } from "lucide-react";
import {
  ALL_PROMPTS,
  BINGO_PLACES,
  BINGO_SIZE,
  BINGO_THEMES,
  CLASSIC_PROMPTS,
  FREE_INDEX,
  PROMPTS_BY_ID,
  type BingoPrompt,
} from "../data/bingo";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import "../styles/bingo.css";

const STORAGE_KEY = "alps-bingo-2026";
/** Swiss Narcotics Act (BetmG, SR 812.121) on Fedlex. */
const NARCOTICS_ACT_URL = "https://www.fedlex.admin.ch/eli/cc/1952/241_241_245/en";
const CELL_COUNT = BINGO_SIZE * BINGO_SIZE;
const CLASSIC_LAYOUT = CLASSIC_PROMPTS.map((prompt) => prompt.id);

type Sighting = {
  where: string;
  when: string;
  notes: string;
  savedAt: string;
};

type BingoState = {
  layout: string[];
  sightings: Record<string, Sighting>;
};

const LINES: number[][] = (() => {
  const range = Array.from({ length: BINGO_SIZE }, (_, i) => i);
  return [
    ...range.map((row) => range.map((col) => row * BINGO_SIZE + col)),
    ...range.map((col) => range.map((row) => row * BINGO_SIZE + col)),
    range.map((i) => i * BINGO_SIZE + i),
    range.map((i) => i * BINGO_SIZE + (BINGO_SIZE - 1 - i)),
  ];
})();

function readState(): BingoState | null {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!saved || typeof saved !== "object") return null;
    const layout = Array.isArray(saved.layout)
      ? saved.layout.filter((id: unknown) => typeof id === "string" && PROMPTS_BY_ID.has(id))
      : [];
    return {
      layout: layout.length === CELL_COUNT - 1 ? layout : CLASSIC_LAYOUT,
      sightings: saved.sightings && typeof saved.sightings === "object" ? saved.sightings : {},
    };
  } catch {
    return null;
  }
}

function writeState(state: BingoState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private mode or blocked storage: the card still works for this visit.
  }
}

function shuffledLayout() {
  const ids = ALL_PROMPTS.map((prompt) => prompt.id);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, CELL_COUNT - 1);
}

function promptAt(layout: string[], index: number): BingoPrompt | null {
  if (index === FREE_INDEX) return null;
  const id = layout[index < FREE_INDEX ? index : index - 1];
  return (id && PROMPTS_BY_ID.get(id)) || null;
}

function nowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

const whenFormat = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : whenFormat.format(date);
}

function cellNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function SightingModal({
  open,
  index,
  prompt,
  sighting,
  onSave,
  onRemove,
  onClose,
  onExited,
}: {
  open: boolean;
  index: number | null;
  prompt: BingoPrompt;
  sighting: Sighting | undefined;
  onSave: (sighting: Omit<Sighting, "savedAt">) => void;
  onRemove: () => void;
  onClose: () => void;
  onExited: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const whereRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const [where, setWhere] = useState(sighting?.where ?? "");
  const [when, setWhen] = useState(sighting?.when ?? nowForInput());
  const [notes, setNotes] = useState(sighting?.notes ?? "");
  const headingId = "bingo-modal-title";

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", handleKey);
    lockBodyScroll();
    focusWithoutScroll(whereRef.current);
    return () => {
      document.removeEventListener("keydown", handleKey);
      unlockBodyScroll();
    };
  }, []);

  useModalMotion(open, overlayRef, panelRef, onExited);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSave({ where: where.trim(), when, notes: notes.trim() });
  };

  return createPortal(
    <div
      ref={overlayRef}
      className={`bingo-modal fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4 opacity-0${open ? "" : " pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div
        ref={panelRef}
        className="bingo-modal__panel relative w-full max-w-md max-h-[90svh] overflow-y-auto p-5 sm:p-7 opacity-0"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white/75 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <p className="bingo-number">{index === null ? "Not on your card" : cellNumber(index)}</p>
        <h2 id={headingId} className="mt-2 pr-10 text-xl font-semibold leading-snug text-white">
          {prompt.text}
        </h2>
        <p className="mt-2 text-sm text-white/65">
          {sighting
            ? `You spotted this one. Edit the details or clear the ${index === null ? "sighting" : "square"}.`
            : "Where did you witness it?"}
          {index === null && " It goes into your sightings but does not count towards a bingo."}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block text-sm font-medium text-white/85">
            Where
            <input
              ref={whereRef}
              value={where}
              onChange={(event) => setWhere(event.target.value)}
              list="bingo-places"
              placeholder="Talk, room or moment"
              autoComplete="off"
              className="links-input"
            />
            <datalist id="bingo-places">
              {BINGO_PLACES.map((place) => (
                <option key={place} value={place} />
              ))}
            </datalist>
          </label>
          <label className="block text-sm font-medium text-white/85">
            When
            <input
              type="datetime-local"
              value={when}
              onChange={(event) => setWhen(event.target.value)}
              className="links-input bingo-input--datetime"
            />
          </label>
          <label className="block text-sm font-medium text-white/85">
            Notes <span className="font-normal text-white/50">(optional)</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="What happened, in a sentence"
              className="links-input resize-y"
            />
          </label>

          <div className="flex flex-col gap-2 pt-1">
            <button type="submit" className="links-button">
              <Check className="h-4 w-4" aria-hidden />
              {sighting ? "Update sighting" : "Mark as spotted"}
            </button>
            {sighting && (
              <button type="button" onClick={onRemove} className="links-button links-button--ghost">
                {index === null ? "Clear this sighting" : "Clear this square"}
              </button>
            )}
          </div>
        </form>

        <p className="mt-5 flex items-center gap-2 text-xs text-white/50">
          <LockKeyhole className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Saved on this device only.
        </p>
      </div>
    </div>,
    document.body
  );
}

export default function BingoPage() {
  const [state, setState] = useState<BingoState>({ layout: CLASSIC_LAYOUT, sightings: {} });
  const [loaded, setLoaded] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const { present, onExited } = useModalPresence(activeId !== null);

  useEffect(() => {
    const saved = readState();
    if (saved) setState(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) writeState(state);
  }, [state, loaded]);

  const cells = useMemo(
    () => Array.from({ length: CELL_COUNT }, (_, index) => promptAt(state.layout, index)),
    [state.layout]
  );

  const marked = useMemo(
    () =>
      cells.map((prompt, index) => index === FREE_INDEX || Boolean(prompt && state.sightings[prompt.id])),
    [cells, state.sightings]
  );

  const completedLines = useMemo(() => LINES.filter((line) => line.every((i) => marked[i])), [marked]);
  const inBingo = useMemo(() => new Set(completedLines.flat()), [completedLines]);
  const spottedCount = marked.filter(Boolean).length - 1;

  const log = useMemo(
    () =>
      Object.entries(state.sightings)
        .map(([id, sighting]) => ({ prompt: PROMPTS_BY_ID.get(id), sighting }))
        .filter((entry): entry is { prompt: BingoPrompt; sighting: Sighting } => Boolean(entry.prompt))
        .sort((a, b) => (b.sighting.when || "").localeCompare(a.sighting.when || "")),
    [state.sightings]
  );
  const onCard = new Set(state.layout);

  const candidateThemes = useMemo(
    () =>
      BINGO_THEMES.map((theme) => ({
        ...theme,
        prompts: theme.prompts.filter((prompt) => !state.layout.includes(prompt.id)),
      })).filter((theme) => theme.prompts.length > 0),
    [state.layout]
  );

  const openPrompt = (id: string) => {
    setModalId(id);
    setActiveId(id);
  };

  const closeModal = () => setActiveId(null);

  const modalPrompt = modalId === null ? null : PROMPTS_BY_ID.get(modalId) ?? null;
  const modalIndex = modalPrompt ? cells.indexOf(modalPrompt) : -1;

  const saveSighting = (details: Omit<Sighting, "savedAt">) => {
    if (!modalPrompt) return;
    setState((current) => ({
      ...current,
      sightings: {
        ...current.sightings,
        [modalPrompt.id]: { ...details, savedAt: new Date().toISOString() },
      },
    }));
    closeModal();
  };

  const removeSighting = () => {
    if (!modalPrompt) return;
    setState((current) => {
      const { [modalPrompt.id]: _removed, ...sightings } = current.sightings;
      return { ...current, sightings };
    });
    closeModal();
  };

  const newCard = () => setState((current) => ({ ...current, layout: shuffledLayout() }));
  const classicCard = () => setState((current) => ({ ...current, layout: CLASSIC_LAYOUT }));
  const clearAll = () => {
    if (window.confirm("Clear every sighting and go back to the classic card?")) {
      setState({ layout: CLASSIC_LAYOUT, sightings: {} });
    }
  };

  const isClassic = state.layout.every((id, i) => id === CLASSIC_LAYOUT[i]);

  return (
    <div className="bingo-page">
      <header className="bingo-head">
        <p className="section-eyebrow">ALPS Conference 2026 · 9–10 October</p>
        <h1 className="section-title">Conference bingo</h1>
        <p className="bingo-sub">
          Tap a square when you witness it and note where. Five in a row, column or diagonal is a bingo.
        </p>
      </header>

      <aside className="bingo-disclaimer" aria-label="Disclaimer">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-light" aria-hidden />
        <p>
          <strong>ALPS does not endorse the consumption of illegal substances.</strong> In Switzerland, LSD,
          psilocybin and MDMA are prohibited under{" "}
          <a href={`${NARCOTICS_ACT_URL}#art_8`} target="_blank" rel="noopener noreferrer">
            Art. 8 of the Narcotics Act (BetmG)
          </a>
          . The Federal Office of Public Health grants exceptional licences only for scientific
          research, medicine development and restricted medical use, where a physician treats an
          individual patient. Consuming them otherwise is an offence (
          <a href={`${NARCOTICS_ACT_URL}#art_19_a`} target="_blank" rel="noopener noreferrer">
            Art. 19a BetmG
          </a>
          ). This card was built from what our members have witnessed at other conferences in the
          field. It is meant to poke fun at our own community and to encourage critical reflection.
        </p>
      </aside>

      <div className="bingo-status" aria-live="polite">
        <span>
          <strong>{spottedCount}</strong> of 24 spotted
        </span>
        {completedLines.length > 0 && (
          <span className="bingo-status__win">
            {completedLines.length === 1 ? "Bingo" : `${completedLines.length} bingos`}
          </span>
        )}
      </div>

      <div className="bingo-card" role="grid" aria-label="Bingo card">
        {cells.map((prompt, index) => {
          const isFree = index === FREE_INDEX;
          const classes = [
            "bingo-cell",
            isFree && "bingo-cell--free",
            marked[index] && !isFree && "bingo-cell--marked",
            inBingo.has(index) && "bingo-cell--line",
          ]
            .filter(Boolean)
            .join(" ");

          if (isFree || !prompt) {
            return (
              <div key={index} className={classes} role="gridcell" aria-label="Free square">
                <span className="bingo-free">free</span>
              </div>
            );
          }

          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              className={classes}
              onClick={() => openPrompt(prompt.id)}
              aria-haspopup="dialog"
              aria-label={`${prompt.text}${marked[index] ? ", spotted" : ""}`}
            >
              <span className="bingo-number">{cellNumber(index)}</span>
              {marked[index] && (
                <span className="bingo-cell__check" aria-hidden>
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <span className="bingo-cell__text">{prompt.text}</span>
            </button>
          );
        })}
      </div>

      <p className="bingo-privacy">
        <LockKeyhole className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          Everything you enter stays in this browser. Nothing is uploaded or shared with ALPS or anyone
          else.
        </span>
      </p>

      <div className="bingo-actions">
        <button type="button" onClick={newCard} className="links-button links-button--ghost">
          <Shuffle className="h-4 w-4" aria-hidden />
          New card
        </button>
        {!isClassic && (
          <button type="button" onClick={classicCard} className="links-button links-button--ghost">
            <RotateCcw className="h-4 w-4" aria-hidden />
            Classic card
          </button>
        )}
        {log.length > 0 && (
          <button type="button" onClick={clearAll} className="links-button links-button--ghost">
            <Trash2 className="h-4 w-4" aria-hidden />
            Clear everything
          </button>
        )}
      </div>

      {log.length > 0 && (
        <section className="bingo-log" aria-labelledby="bingo-log-title">
          <h2 id="bingo-log-title" className="links-eyebrow">
            Your sightings
          </h2>
          <ul>
            {log.map(({ prompt, sighting }) => (
              <li key={prompt.id}>
                <p className="font-medium text-white">{prompt.text}</p>
                <p className="mt-1 text-sm text-white/65">
                  {[sighting.where, sighting.when && formatWhen(sighting.when)].filter(Boolean).join(" · ") ||
                    "No details"}
                  {!onCard.has(prompt.id) && <span className="text-white/45"> · not on this card</span>}
                </p>
                {sighting.notes && <p className="mt-1.5 text-sm text-white/80">{sighting.notes}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="bingo-candidates" aria-labelledby="bingo-candidates-title">
        <h2 id="bingo-candidates-title" className="bingo-candidates__title">
          Other candidates
        </h2>
        <p className="mt-2 text-sm text-white/65">
          Not on your card, but they happen too. Tap one to log it, or draw a new card to mix them in.
        </p>
        {candidateThemes.map((theme) => (
          <div key={theme.id} className="bingo-candidates__group">
            <h3 className="links-eyebrow">{theme.label}</h3>
            <ul>
              {theme.prompts.map((prompt) => {
                const spotted = Boolean(state.sightings[prompt.id]);
                return (
                  <li key={prompt.id}>
                    <button
                      type="button"
                      onClick={() => openPrompt(prompt.id)}
                      className={`bingo-candidate${spotted ? " bingo-candidate--marked" : ""}`}
                      aria-haspopup="dialog"
                      aria-label={`${prompt.text}${spotted ? ", spotted" : ""}`}
                    >
                      <span>{prompt.text}</span>
                      {spotted && (
                        <span className="bingo-cell__check" aria-hidden>
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      {present && modalPrompt && (
        <SightingModal
          key={modalPrompt.id}
          open={activeId !== null}
          index={modalIndex === -1 ? null : modalIndex}
          prompt={modalPrompt}
          sighting={state.sightings[modalPrompt.id]}
          onSave={saveSighting}
          onRemove={removeSighting}
          onClose={closeModal}
          onExited={onExited}
        />
      )}
    </div>
  );
}
