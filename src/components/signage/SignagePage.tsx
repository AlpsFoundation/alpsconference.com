import { memo, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  Check,
  ChevronDown,
  Copy,
  Crosshair,
  Eye,
  Minus,
  Pencil,
  Plus,
  Printer,
  RotateCcw,
  RotateCw,
  Search,
  Trash2,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  buildSigns,
  SIGN_ART,
  SIGN_ARROWS,
  SIGN_CATEGORIES,
  SIGN_ICONS,
  signName,
  type Sign,
  type SignArrow,
  type SignArt,
  type SignIcon,
  type SignOrientation,
} from "../../data/signage";
import { withBase } from "../../lib/withBase";
import { SignSheet } from "./SignSheet";
import { buildPrompt, changeCount, describeEdit, type SignEdit } from "./prompt";
import { Particles, playBoom, playShot, pop, prefersReducedMotion, shake, shatter } from "./shooter";

/* ---------------------------------------------------------------- storage -- */

type Stored = {
  removed: string[];
  edits: Record<string, SignEdit>;
  added: Sign[];
  selection: Record<string, number>;
  arrows: Record<string, SignArrow>;
  lineArt: boolean;
  muted: boolean;
};

const STORAGE_KEY = "alps-signage:v1";
const EMPTY: Stored = { removed: [], edits: {}, added: [], selection: {}, arrows: {}, lineArt: true, muted: false };

// Per-viewer convenience only: what you picked, edited or blasted stays in this browser.
function readStored(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

function writeStored(value: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
}

/* ----------------------------------------------------------------- drafts -- */

type Draft = {
  orientation: SignOrientation;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  icon: SignIcon | "";
  arrow: SignArrow | "";
  markers: string;
  qrUrl: string;
  qrLabel: string;
  art: SignArt | "";
};

const BLANK_DRAFT: Draft = {
  orientation: "portrait",
  eyebrow: "",
  title: "",
  subtitle: "",
  body: "",
  icon: "",
  arrow: "",
  markers: "",
  qrUrl: "",
  qrLabel: "",
  art: "synapse",
};

function signToDraft(sign: Sign): Draft {
  return {
    orientation: sign.orientation ?? "portrait",
    eyebrow: sign.eyebrow ?? "",
    title: sign.title,
    subtitle: sign.subtitle ?? "",
    body: (sign.body ?? []).join("\n\n"),
    icon: sign.icon ?? "",
    arrow: sign.arrow ?? "",
    markers: (sign.markers ?? []).join(", "),
    qrUrl: sign.qr?.url ?? "",
    qrLabel: sign.qr?.label ?? "",
    art: sign.art ?? "",
  };
}

const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function draftToEdit(draft: Draft): SignEdit {
  const body = draft.body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const markers = draft.markers
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  const url = draft.qrUrl.trim();
  return {
    orientation: draft.orientation,
    eyebrow: draft.eyebrow.trim() || undefined,
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim() || undefined,
    body: body.length ? body : undefined,
    icon: draft.icon || undefined,
    arrow: draft.arrow || undefined,
    markers: markers.length ? markers : undefined,
    qr: url ? { url: /^https?:\/\//.test(url) ? url : `https://${url}`, label: draft.qrLabel.trim() || shortUrl(url) } : undefined,
    art: draft.art || undefined,
  };
}

/** Applies an edit, keeping a sign's other fields and the generated ones (rows, sheets, captions). */
function applyEdit(sign: Sign, edit?: SignEdit): Sign {
  if (!edit) return sign;
  const next: Sign = { ...sign, ...edit };
  // A changed QR link drops the caption written for the old one.
  if (edit.qr && sign.qr && edit.qr.url === sign.qr.url) next.qr = { ...sign.qr, ...edit.qr };
  return next;
}

/* ---------------------------------------------------------------- helpers -- */

/** One sheet per copy. */
const expand = (list: { sign: Sign; copies: number }[]) =>
  list.flatMap(({ sign, copies }) => Array.from({ length: copies }, () => sign));

const CUSTOM = "custom";
const ARROW_LABEL: Record<SignArrow, string> = {
  up: "Up",
  "up-right": "Up right",
  right: "Right",
  "down-right": "Down right",
  down: "Down",
  "down-left": "Down left",
  left: "Left",
  "up-left": "Up left",
};

function matches(sign: Sign, query: string) {
  if (!query) return true;
  const haystack = [sign.id, sign.name, sign.title, sign.eyebrow, sign.subtitle, ...(sign.body ?? []), ...(sign.rows ?? []).map((row) => row.label)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const fonts = document.fonts;
    if (!fonts) {
      setReady(true);
      return;
    }
    Promise.all([fonts.load("800 100px Switzer"), fonts.load("500 100px Switzer")])
      .then(() => fonts.ready)
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

/* ------------------------------------------------------------------ cards -- */

type CardProps = {
  sign: Sign;
  copies: number;
  edited: boolean;
  custom: boolean;
  removed: boolean;
  lineArt: boolean;
  fontsReady: boolean;
  onCopies: (id: string, copies: number) => void;
  onRotate: (id: string) => void;
  onEdit: (id: string) => void;
  onOpen: (id: string) => void;
  onShoot: (id: string, target: HTMLElement, x: number, y: number) => void;
  onRestore: (id: string) => void;
};

const Card = memo(function Card({
  sign,
  copies,
  edited,
  custom,
  removed,
  lineArt,
  fontsReady,
  onCopies,
  onRotate,
  onEdit,
  onOpen,
  onShoot,
  onRestore,
}: CardProps) {
  const previewRef = useRef<HTMLButtonElement>(null);
  const name = signName(sign);

  if (removed) {
    return (
      <article className="sg-card">
        <div className={`sg-wreck ${sign.orientation === "landscape" ? "is-landscape" : ""}`}>
          <span className="sg-wreck__scorch" aria-hidden="true" />
          <strong>Blasted</strong>
          <p>{name}</p>
          <button type="button" className="sg-btn sg-btn--small" onClick={() => onRestore(sign.id)}>
            <RotateCcw size={14} strokeWidth={1.75} aria-hidden="true" />
            Restore
          </button>
        </div>
      </article>
    );
  }

  const handlePreview = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const root = previewRef.current?.closest<HTMLElement>(".sg");
    if (root?.dataset.shooter === "on") {
      event.stopPropagation();
      const rect = event.currentTarget.getBoundingClientRect();
      // Keyboard "clicks" have no pointer position: aim for the middle.
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      onShoot(sign.id, event.currentTarget, x, y);
      return;
    }
    onOpen(sign.id);
  };

  const blast = () => {
    const el = previewRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onShoot(sign.id, el, rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <article className={`sg-card ${copies ? "is-selected" : ""}`}>
      <button ref={previewRef} type="button" className="sg-card__preview" onClick={handlePreview} aria-label={`${name}: open a large preview`}>
        <SignSheet sign={sign} lineArt={lineArt} fontsReady={fontsReady} />
        {copies > 0 && <span className="sg-card__badge" aria-hidden="true">{copies}×</span>}
      </button>
      <div className="sg-card__meta">
        <div>
          <p className="sg-card__name">{name}</p>
          <p className="sg-card__id">{sign.id}</p>
          {(edited || custom || sign.derived) && (
            <div className="sg-card__tags">
              {custom && <span className="sg-tag sg-tag--accent">Yours</span>}
              {edited && <span className="sg-tag sg-tag--accent">Edited</span>}
              {sign.derived && <span className="sg-tag">From the program</span>}
            </div>
          )}
        </div>
      </div>
      <div className="sg-card__controls">
        <label className="sg-check">
          <input type="checkbox" checked={copies > 0} onChange={(event) => onCopies(sign.id, event.target.checked ? 1 : 0)} />
          Print
        </label>
        {copies > 0 && (
          <span className="sg-copies" aria-label="Copies">
            <button type="button" onClick={() => onCopies(sign.id, copies - 1)} aria-label="One copy fewer">
              <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
            <span>{copies}</span>
            <button type="button" onClick={() => onCopies(sign.id, Math.min(copies + 1, 20))} aria-label="One more copy">
              <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            </button>
          </span>
        )}
        {sign.arrow && (
          <button type="button" className="sg-icon-btn" onClick={() => onRotate(sign.id)} title={`Arrow: ${ARROW_LABEL[sign.arrow]}. Turn it`} aria-label={`Turn the arrow (now ${ARROW_LABEL[sign.arrow].toLowerCase()})`}>
            <RotateCw size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        )}
        <button type="button" className="sg-icon-btn" onClick={() => onEdit(sign.id)} title="Edit" aria-label={`Edit ${name}`}>
          <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <button type="button" className="sg-btn sg-btn--small sg-btn--accent sg-blast-btn" onClick={blast}>
          <Crosshair size={14} strokeWidth={1.75} aria-hidden="true" />
          Blast
        </button>
      </div>
    </article>
  );
});

/* ---------------------------------------------------------------- builder -- */

function Field({ label, hint, wide, children }: { label: string; hint?: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <label className={`sg-field ${wide ? "sg-field--wide" : ""}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

type BuilderProps = {
  open: boolean;
  onToggle: (open: boolean) => void;
  base: Sign | null;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSave: () => void;
  onRevert: () => void;
  onCancel: () => void;
  lineArt: boolean;
  fontsReady: boolean;
  hasEdit: boolean;
};

function Builder({ open, onToggle, base, draft, setDraft, onSave, onRevert, onCancel, lineArt, fontsReady, hasEdit }: BuilderProps) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  const preview = useMemo<Sign>(() => {
    const edit = draftToEdit(draft);
    return base ? applyEdit(base, edit) : { id: "draft", category: "arrows", ...edit, title: edit.title ?? "" };
  }, [base, draft]);
  const generated = Boolean(base && (base.rows?.length || base.sheet || base.figure));

  return (
    <details className="sg-builder" id="builder" open={open} onToggle={(event) => onToggle((event.currentTarget as HTMLDetailsElement).open)}>
      <summary>
        <div>
          <h2>{base ? `Edit “${signName(base)}”` : "Make your own sign"}</h2>
          <p>{base ? "Your changes show on the card and go into the prompt." : "Same layout, type and line art as the others. It is added under “Your signs”."}</p>
        </div>
        <ChevronDown size={20} strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div className="sg-builder__body">
        <form
          className="sg-form"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <Field label="Eyebrow" hint="Small capitals above the title">
            <input value={draft.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} placeholder="Saturday · 16:00" />
          </Field>
          <Field label="Orientation">
            <select value={draft.orientation} onChange={(event) => set("orientation", event.target.value as SignOrientation)}>
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </Field>
          <Field label="Title" wide hint="Sentence case. It is sized to fit the page.">
            <input value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Group picture here" />
          </Field>
          <Field label="Subtitle" wide>
            <input value={draft.subtitle} onChange={(event) => set("subtitle", event.target.value)} />
          </Field>
          <Field label="Text" wide hint="Leave an empty line between paragraphs.">
            <textarea value={draft.body} onChange={(event) => set("body", event.target.value)} />
          </Field>
          <Field label="Icon">
            <select value={draft.icon} onChange={(event) => set("icon", event.target.value as SignIcon | "")}>
              <option value="">None</option>
              {SIGN_ICONS.map((icon) => (
                <option key={icon.id} value={icon.id}>{icon.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Arrow" hint="Replaces the icon">
            <select value={draft.arrow} onChange={(event) => set("arrow", event.target.value as SignArrow | "")}>
              <option value="">None</option>
              {SIGN_ARROWS.map((arrow) => (
                <option key={arrow} value={arrow}>{ARROW_LABEL[arrow]}</option>
              ))}
            </select>
          </Field>
          <Field label="QR code link">
            <input value={draft.qrUrl} onChange={(event) => set("qrUrl", event.target.value)} placeholder="https://alpsconference.com/links" inputMode="url" />
          </Field>
          <Field label="QR code label">
            <input value={draft.qrLabel} onChange={(event) => set("qrLabel", event.target.value)} placeholder="alpsconference.com/links" />
          </Field>
          <Field label="Venue map numbers" hint="From /map, e.g. 8, 9">
            <input value={draft.markers} onChange={(event) => set("markers", event.target.value)} inputMode="numeric" />
          </Field>
          <Field label="Line art">
            <select value={draft.art} onChange={(event) => set("art", event.target.value as SignArt | "")}>
              {base && <option value="">Category default</option>}
              {SIGN_ART.map((art) => (
                <option key={art.id} value={art.id}>{art.label}</option>
              ))}
            </select>
          </Field>
          {generated && (
            <p className="sg-builder__note">
              The lists on this sign come from the program data, so they are not editable here. Change the text around them,
              or ask for the data change in the prompt.
            </p>
          )}
          <div className="sg-form__actions">
            <button type="submit" className="sg-btn sg-btn--primary" disabled={!base && !draft.title.trim() && !draft.arrow && !draft.icon}>
              <Check size={16} strokeWidth={1.75} aria-hidden="true" />
              {base ? "Save changes" : "Add to your signs"}
            </button>
            {base && hasEdit && (
              <button type="button" className="sg-btn" onClick={onRevert}>
                <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
                Back to the original
              </button>
            )}
            <button type="button" className="sg-btn" onClick={onCancel}>
              {base ? "Close" : "Clear"}
            </button>
          </div>
        </form>
        <div className="sg-builder__preview">
          <div style={{ width: preview.orientation === "landscape" ? "100%" : "min(100%, 300px)" }}>
            <SignSheet sign={preview} lineArt={lineArt} fontsReady={fontsReady} />
          </div>
          <p>Preview at A4 proportions</p>
        </div>
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------- page -- */

export default function SignagePage() {
  const library = useMemo(() => buildSigns(), []);
  const [stored, setStored] = useState<Stored>(() => (typeof window === "undefined" ? EMPTY : readStored()));
  const [category, setCategory] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [shooter, setShooter] = useState(false);
  // `open` is false when the browser's own print shortcut started the job: its dialog is already on its way.
  const [printJob, setPrintJob] = useState<{ signs: Sign[]; open: boolean } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ shots: 0, hits: 0 });
  const fontsReady = useFontsReady();

  const rootRef = useRef<HTMLDivElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particles | null>(null);
  const history = useRef<string[]>([]);
  const combo = useRef({ count: 0, at: 0 });
  const previewDialog = useRef<HTMLDialogElement>(null);
  const promptDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => writeStored(stored), [stored]);
  const update = useCallback((fn: (prev: Stored) => Stored) => setStored(fn), []);

  /* Signs as they will print: edits and arrow turns applied, your own signs appended. */
  const signs = useMemo(() => {
    const own = stored.added.map((sign) => ({ ...sign }));
    return [...own, ...library].map((sign) => {
      const edited = applyEdit(sign, stored.edits[sign.id]);
      const arrow = stored.arrows[sign.id];
      return arrow && edited.arrow ? { ...edited, arrow } : edited;
    });
  }, [library, stored.added, stored.edits, stored.arrows]);
  const byId = useMemo(() => new Map(signs.map((sign) => [sign.id, sign])), [signs]);
  const customIds = useMemo(() => new Set(stored.added.map((sign) => sign.id)), [stored.added]);
  const removedSet = useMemo(() => new Set(stored.removed), [stored.removed]);

  const visible = useMemo(
    () =>
      signs.filter((sign) => {
        if (!matches(sign, query.trim())) return false;
        if (category === "all") return true;
        if (category === CUSTOM) return customIds.has(sign.id);
        if (category === "selected") return (stored.selection[sign.id] ?? 0) > 0;
        return !customIds.has(sign.id) && sign.category === category;
      }),
    [signs, query, category, customIds, stored.selection],
  );

  const groups = useMemo(() => {
    const list: { id: string; label: string; hint?: string; signs: Sign[] }[] = [];
    const own = visible.filter((sign) => customIds.has(sign.id));
    if (own.length) list.push({ id: CUSTOM, label: "Your signs", hint: "Made with the builder above", signs: own });
    for (const group of SIGN_CATEGORIES) {
      const items = visible.filter((sign) => !customIds.has(sign.id) && sign.category === group.id);
      if (items.length) list.push({ id: group.id, label: group.label, hint: group.hint, signs: items });
    }
    return list;
  }, [visible, customIds]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: 0, [CUSTOM]: 0 };
    for (const sign of signs) {
      if (removedSet.has(sign.id)) continue;
      map.all += 1;
      const key = customIds.has(sign.id) ? CUSTOM : sign.category;
      map[key] = (map[key] ?? 0) + 1;
    }
    return map;
  }, [signs, removedSet, customIds]);

  const selectionList = useMemo(
    () =>
      signs
        .filter((sign) => (stored.selection[sign.id] ?? 0) > 0 && !removedSet.has(sign.id))
        .map((sign) => ({ sign, copies: stored.selection[sign.id] })),
    [signs, stored.selection, removedSet],
  );
  const pageCount = selectionList.reduce((sum, item) => sum + item.copies, 0);

  /* ------------------------------------------------------------ actions -- */

  const setCopies = useCallback(
    (id: string, copies: number) =>
      update((prev) => {
        const selection = { ...prev.selection };
        if (copies > 0) selection[id] = copies;
        else delete selection[id];
        return { ...prev, selection };
      }),
    [update],
  );

  const rotate = useCallback(
    (id: string) =>
      update((prev) => {
        const current = prev.arrows[id] ?? applyEdit(library.find((s) => s.id === id) ?? prev.added.find((s) => s.id === id)!, prev.edits[id]).arrow ?? "right";
        const next = SIGN_ARROWS[(SIGN_ARROWS.indexOf(current) + 1) % SIGN_ARROWS.length];
        return { ...prev, arrows: { ...prev.arrows, [id]: next } };
      }),
    [update, library],
  );

  const openBuilder = useCallback(() => {
    setBuilderOpen(true);
    requestAnimationFrame(() => document.getElementById("builder")?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" }));
  }, []);

  const startEdit = useCallback(
    (id: string) => {
      const sign = byId.get(id);
      if (!sign) return;
      previewDialog.current?.close();
      setEditingId(id);
      setDraft(signToDraft(sign));
      openBuilder();
    },
    [byId, openBuilder],
  );

  const saveDraft = () => {
    const edit = draftToEdit(draft);
    if (editingId && customIds.has(editingId)) {
      update((prev) => ({ ...prev, added: prev.added.map((sign) => (sign.id === editingId ? applyEdit(sign, edit) : sign)) }));
    } else if (editingId) {
      update((prev) => ({ ...prev, edits: { ...prev.edits, [editingId]: edit } }));
    } else {
      const id = `${CUSTOM}-${Date.now().toString(36)}`;
      const sign: Sign = { id, category: "arrows", ...edit, title: edit.title ?? "" };
      update((prev) => ({ ...prev, added: [...prev.added, sign], selection: { ...prev.selection, [id]: 1 } }));
      setDraft(BLANK_DRAFT);
      return;
    }
    setEditingId(null);
    setDraft(BLANK_DRAFT);
    setBuilderOpen(false);
  };

  const revertEdit = () => {
    if (!editingId) return;
    update((prev) => {
      const { [editingId]: _gone, ...edits } = prev.edits;
      return { ...prev, edits };
    });
    const original = library.find((sign) => sign.id === editingId);
    if (original) setDraft(signToDraft(original));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(BLANK_DRAFT);
    if (editingId) setBuilderOpen(false);
  };

  const restore = useCallback(
    (id: string) => {
      history.current = history.current.filter((entry) => entry !== id);
      update((prev) => ({ ...prev, removed: prev.removed.filter((entry) => entry !== id) }));
    },
    [update],
  );

  const openPreview = useCallback((id: string) => {
    setPreviewId(id);
    requestAnimationFrame(() => previewDialog.current?.showModal());
  }, []);

  /* --------------------------------------------------------------- print -- */

  const print = (list: { sign: Sign; copies: number }[]) => {
    if (!list.length) return;
    setPrintJob({ signs: expand(list), open: true });
  };

  useEffect(() => {
    if (!printJob) return;
    let cancelled = false;
    const done = () => setPrintJob(null);
    if (!printJob.open) {
      window.addEventListener("afterprint", done, { once: true });
      return () => window.removeEventListener("afterprint", done);
    }
    (async () => {
      const root = document.querySelector(".sg-print");
      await document.fonts?.ready;
      await Promise.all([...(root?.querySelectorAll("img") ?? [])].map((img) => img.decode().catch(() => undefined)));
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      if (cancelled) return;
      window.addEventListener("afterprint", done, { once: true });
      window.print();
    })();
    return () => {
      cancelled = true;
      window.removeEventListener("afterprint", done);
    };
  }, [printJob]);

  // Cmd/Ctrl+P prints the selection too.
  useEffect(() => {
    const before = () => {
      if (document.querySelector(".sg-print .sign")) return;
      if (!selectionList.length) return;
      flushSync(() => setPrintJob({ signs: expand(selectionList), open: false }));
    };
    window.addEventListener("beforeprint", before);
    return () => window.removeEventListener("beforeprint", before);
  }, [selectionList]);

  /* ------------------------------------------------------------- shooter -- */

  useEffect(() => {
    if (!shooter || !fxRef.current) return;
    particles.current = new Particles(fxRef.current);
    return () => {
      particles.current?.destroy();
      particles.current = null;
    };
  }, [shooter]);

  const shoot = useCallback(
    (id: string, target: HTMLElement, x: number, y: number) => {
      const sign = byId.get(id);
      if (!sign) return;
      const reduced = prefersReducedMotion();
      const fx = particles.current;
      if (!stored.muted) playShot();
      fx?.muzzle(x, y);

      const now = performance.now();
      combo.current = now - combo.current.at < 1600 ? { count: combo.current.count + 1, at: now } : { count: 1, at: now };
      const streak = combo.current.count;

      const sheet = target.querySelector<HTMLElement>(".sign") ?? target;
      const rect = sheet.getBoundingClientRect();
      if (!reduced) {
        target.classList.add("is-hit");
        void shatter(sheet, x, y);
        if (rootRef.current) shake(rootRef.current);
      }
      window.setTimeout(() => {
        if (!stored.muted) playBoom(streak >= 3);
        fx?.explode(rect.left + rect.width / 2, rect.top + rect.height / 2, Math.min(1 + (streak - 1) * 0.35, 2));
      }, reduced ? 0 : 60);

      pop("+1", x, y - 10);
      const words = ["", "", "Double blast", "Triple blast", "Rampage", "Unstoppable", "Sign-ocalypse"];
      if (streak >= 2) window.setTimeout(() => pop(words[Math.min(streak, words.length - 1)], window.innerWidth / 2, window.innerHeight * 0.38, true), 120);

      history.current.push(id);
      setStats((prev) => ({ shots: prev.shots + 1, hits: prev.hits + 1 }));
      // A whole category gone earns a cheer.
      const removed = [...stored.removed, id];
      if (!customIds.has(id) && library.filter((entry) => entry.category === sign.category).every((entry) => removed.includes(entry.id))) {
        const label = SIGN_CATEGORIES.find((entry) => entry.id === sign.category)?.label;
        window.setTimeout(() => pop(`${label} cleared`, window.innerWidth / 2, window.innerHeight * 0.5, true), 520);
      }
      update((prev) => {
        const { [id]: _unselected, ...selection } = prev.selection;
        return { ...prev, removed: prev.removed.includes(id) ? prev.removed : [...prev.removed, id], selection };
      });
    },
    [byId, stored.muted, stored.removed, update, library, customIds],
  );

  const miss = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!shooter) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, summary, .sg-hud, .sg-builder, .sg-toolbar, .sg-wreck")) return;
    if (!stored.muted) playShot();
    particles.current?.muzzle(event.clientX, event.clientY);
    setStats((prev) => ({ ...prev, shots: prev.shots + 1 }));
  };

  const undo = () => {
    const id = history.current.pop() ?? stored.removed[stored.removed.length - 1];
    if (id) restore(id);
  };

  const resetBlasts = () => {
    if (!stored.removed.length) return;
    if (!window.confirm(`Bring back all ${stored.removed.length} blasted signs?`)) return;
    history.current = [];
    setStats({ shots: 0, hits: 0 });
    update((prev) => ({ ...prev, removed: [] }));
  };

  const promptInput = useMemo(
    () => ({
      library,
      removed: stored.removed.filter((id) => !customIds.has(id)),
      edits: stored.edits,
      added: stored.added.filter((sign) => !removedSet.has(sign.id)),
    }),
    [library, stored.removed, stored.edits, stored.added, customIds, removedSet],
  );
  const prompt = useMemo(() => buildPrompt(promptInput), [promptInput]);
  const changes = useMemo(() => changeCount(promptInput), [promptInput]);
  const changeTotal = changes.removed + changes.edited + changes.added;

  const copyPrompt = async () => {
    const ok = await copyText(prompt);
    if (!ok) {
      setPromptOpen(true);
      requestAnimationFrame(() => promptDialog.current?.showModal());
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  const viewPrompt = () => {
    setPromptOpen(true);
    requestAnimationFrame(() => promptDialog.current?.showModal());
  };

  const previewSign = previewId ? byId.get(previewId) : undefined;
  const editingBase = editingId ? byId.get(editingId) ?? null : null;
  const left = counts.all;
  const accuracy = stats.shots ? Math.round((stats.hits / stats.shots) * 100) : 100;

  /* -------------------------------------------------------------- render -- */

  return (
    <div className="sg" ref={rootRef} data-shooter={shooter ? "on" : "off"} onClick={miss}>
      <header className="sg-header">
        <img className="sg-header__logo" src={withBase("img/logo.png")} alt="ALPS Research Conference" />
        <p className="sg-eyebrow">ALPS Conference 2026 · on-site signage</p>
        <h1>Signage</h1>
        <p className="sg-lede">
          Print-ready A4 signs for the Kultur &amp; Kongresshaus Aarau: wayfinding with the numbers from the venue map,
          door signs for every experience, buffet menus, QR codes to the attendee pages and the time signals for the stage.
          Black on white with the booklet’s line art, so they print on any office printer.
        </p>
        <ul className="sg-tips">
          <li>
            <Printer size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>
              <strong>Tick, then print.</strong> Pick the signs and copies, then press Print. In the dialog choose A4, scale
              100% and no margins, or Save as PDF for the print shop.
            </span>
          </li>
          <li>
            <RotateCw size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>
              <strong>Point the arrows.</strong> Turn the arrow on any direction sign to match where it hangs. Turning it
              changes only your print.
            </span>
          </li>
          <li>
            <Pencil size={18} strokeWidth={1.75} aria-hidden="true" />
            <span>
              <strong>Edit or make your own.</strong> Reword any sign or build a new one. The program, menus and experience
              times come straight from the conference data.
            </span>
          </li>
        </ul>
      </header>

      <div className="sg-toolbar">
        <div className="sg-toolbar__row">
          <label className="sg-search">
            <Search size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="sr-only">Search signs</span>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search signs" />
          </label>
          <label className="sg-switch">
            <input type="checkbox" checked={stored.lineArt} onChange={(event) => update((prev) => ({ ...prev, lineArt: event.target.checked }))} />
            <span className="sg-switch__track" aria-hidden="true" />
            Line art
          </label>
          <button type="button" className="sg-btn sg-btn--small" onClick={() => { setEditingId(null); setDraft(BLANK_DRAFT); openBuilder(); }}>
            <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
            New sign
          </button>
          <div className="sg-selection" aria-live="polite">
            <span>
              <strong>{selectionList.length}</strong> {selectionList.length === 1 ? "sign" : "signs"} · <strong>{pageCount}</strong> {pageCount === 1 ? "page" : "pages"}
            </span>
            {selectionList.length > 0 && (
              <button type="button" className="sg-btn sg-btn--small" onClick={() => update((prev) => ({ ...prev, selection: {} }))}>
                Clear
              </button>
            )}
            <button type="button" className="sg-btn sg-btn--primary" disabled={!pageCount} onClick={() => print(selectionList)}>
              <Printer size={16} strokeWidth={1.75} aria-hidden="true" />
              Print
            </button>
          </div>
        </div>
        <div className="sg-chips" role="group" aria-label="Categories">
          {[
            { id: "all", label: "All" },
            ...(counts[CUSTOM] ? [{ id: CUSTOM, label: "Your signs" }] : []),
            ...(selectionList.length ? [{ id: "selected", label: "To print" }] : []),
            ...SIGN_CATEGORIES,
          ].map((chip) => (
            <button key={chip.id} type="button" className="sg-chip" aria-pressed={category === chip.id} onClick={() => setCategory(chip.id)}>
              {chip.label}
              <span>{chip.id === "selected" ? selectionList.length : counts[chip.id] ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <Builder
        open={builderOpen}
        onToggle={setBuilderOpen}
        base={editingBase}
        draft={draft}
        setDraft={setDraft}
        onSave={saveDraft}
        onRevert={revertEdit}
        onCancel={cancelEdit}
        lineArt={stored.lineArt}
        fontsReady={fontsReady}
        hasEdit={Boolean(editingId && stored.edits[editingId])}
      />

      <main>
        {groups.length === 0 && <p className="sg-empty">No sign matches “{query}”.</p>}
        {groups.map((group) => {
          const live = group.signs.filter((sign) => !removedSet.has(sign.id));
          const allSelected = live.length > 0 && live.every((sign) => (stored.selection[sign.id] ?? 0) > 0);
          return (
            <section key={group.id} className="sg-group" aria-labelledby={`group-${group.id}`}>
              <div className="sg-group__head">
                <div>
                  <h2 id={`group-${group.id}`}>{group.label}</h2>
                  {group.hint && <p>{group.hint}</p>}
                </div>
                {live.length > 0 && (
                  <div className="sg-group__actions">
                    <button
                      type="button"
                      className="sg-btn sg-btn--small"
                      onClick={() =>
                        update((prev) => {
                          const selection = { ...prev.selection };
                          for (const sign of live) {
                            if (allSelected) delete selection[sign.id];
                            else selection[sign.id] = selection[sign.id] || 1;
                          }
                          return { ...prev, selection };
                        })
                      }
                    >
                      {allSelected ? "Unselect all" : "Select all"}
                    </button>
                  </div>
                )}
              </div>
              <div className="sg-grid">
                {group.signs.map((sign) => (
                  <Card
                    key={sign.id}
                    sign={sign}
                    copies={stored.selection[sign.id] ?? 0}
                    edited={Boolean(stored.edits[sign.id] && describeEdit(library.find((s) => s.id === sign.id) ?? sign, stored.edits[sign.id]).length)}
                    custom={customIds.has(sign.id)}
                    removed={removedSet.has(sign.id)}
                    lineArt={stored.lineArt}
                    fontsReady={fontsReady}
                    onCopies={setCopies}
                    onRotate={rotate}
                    onEdit={startEdit}
                    onOpen={openPreview}
                    onShoot={shoot}
                    onRestore={restore}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <footer className="sg-footer">
        <div className="sg-footer__row">
          <label className="sg-switch sg-switch--accent">
            <input
              type="checkbox"
              checked={shooter}
              onChange={(event) => {
                setShooter(event.target.checked);
                if (event.target.checked) setStats({ shots: 0, hits: 0 });
              }}
            />
            <span className="sg-switch__track" aria-hidden="true" />
            Shooter mode: blast the signs we won’t use
          </label>
          {changeTotal > 0 && !shooter && (
            <button type="button" className="sg-btn sg-btn--small" onClick={viewPrompt}>
              <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
              Prompt with {changeTotal} {changeTotal === 1 ? "change" : "changes"}
            </button>
          )}
        </div>
        <p>
          Blasted, edited and new signs stay in this browser. Shooter mode turns them into a prompt for Claude Code that
          makes the same changes to the generator for everyone. Line art from the conference booklet; source in{" "}
          <code>src/data/signage.ts</code>.
        </p>
      </footer>

      {shooter && (
        <>
          <canvas ref={fxRef} className="sg-fx" aria-hidden="true" />
          <div className="sg-hud" role="region" aria-label="Shooter mode">
            <div className="sg-hud__score" aria-live="polite">
              <span className="sg-hud__stat sg-hud__stat--accent"><strong>{changes.removed}</strong> blasted</span>
              <span className="sg-hud__stat"><strong>{left}</strong> left</span>
              <span className="sg-hud__stat"><strong>{accuracy}%</strong> accuracy</span>
              {changes.edited + changes.added > 0 && (
                <span className="sg-hud__stat"><strong>{changes.edited + changes.added}</strong> edited or new</span>
              )}
            </div>
            <div className="sg-hud__actions">
              <button type="button" className="sg-icon-btn" onClick={() => update((prev) => ({ ...prev, muted: !prev.muted }))} aria-label={stored.muted ? "Sound on" : "Sound off"} title={stored.muted ? "Sound on" : "Sound off"}>
                {stored.muted ? <VolumeX size={16} strokeWidth={1.75} aria-hidden="true" /> : <Volume2 size={16} strokeWidth={1.75} aria-hidden="true" />}
              </button>
              <button type="button" className="sg-btn sg-btn--small" onClick={undo} disabled={!stored.removed.length}>
                <Undo2 size={14} strokeWidth={1.75} aria-hidden="true" />
                Undo
              </button>
              <button type="button" className="sg-btn sg-btn--small" onClick={resetBlasts} disabled={!stored.removed.length}>
                <Trash2 size={14} strokeWidth={1.75} aria-hidden="true" />
                Reset
              </button>
              <button type="button" className="sg-btn sg-btn--small" onClick={viewPrompt}>
                <Eye size={14} strokeWidth={1.75} aria-hidden="true" />
                View prompt
              </button>
              <button type="button" className="sg-btn sg-btn--accent" onClick={copyPrompt}>
                {copied ? <Check size={16} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.75} aria-hidden="true" />}
                {copied ? "Copied" : "Copy prompt"}
              </button>
              <button type="button" className="sg-icon-btn" onClick={() => setShooter(false)} aria-label="Leave shooter mode" title="Leave shooter mode">
                <X size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}

      <dialog ref={previewDialog} className="sg-dialog" onClose={() => setPreviewId(null)} onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}>
        {previewSign && (
          <div className="sg-dialog__inner">
            <div className="sg-dialog__sheet">
              <SignSheet sign={previewSign} lineArt={stored.lineArt} fontsReady={fontsReady} />
            </div>
            <div className="sg-dialog__side">
              <p className="sg-eyebrow">{customIds.has(previewSign.id) ? "Your signs" : SIGN_CATEGORIES.find((entry) => entry.id === previewSign.category)?.label}</p>
              <h2>{signName(previewSign)}</h2>
              <p>
                {previewSign.orientation === "landscape" ? "A4 landscape" : "A4 portrait"} · <code>{previewSign.id}</code>
                {previewSign.qr && (
                  <>
                    <br />
                    QR code: {previewSign.qr.url}
                  </>
                )}
              </p>
              <div className="sg-dialog__actions">
                <button type="button" className="sg-btn sg-btn--primary" onClick={() => print([{ sign: previewSign, copies: 1 }])}>
                  <Printer size={16} strokeWidth={1.75} aria-hidden="true" />
                  Print this sign
                </button>
                <button
                  type="button"
                  className="sg-btn"
                  onClick={() => setCopies(previewSign.id, (stored.selection[previewSign.id] ?? 0) > 0 ? 0 : 1)}
                >
                  {(stored.selection[previewSign.id] ?? 0) > 0 ? "Remove from print" : "Add to print"}
                </button>
                <button type="button" className="sg-btn" onClick={() => startEdit(previewSign.id)}>
                  <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                  Edit
                </button>
                <button type="button" className="sg-btn" onClick={() => previewDialog.current?.close()}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <dialog ref={promptDialog} className="sg-dialog sg-prompt-dialog" onClose={() => setPromptOpen(false)}>
        {promptOpen && (
          <div className="sg-dialog__inner">
            <div className="sg-dialog__side">
              <p className="sg-eyebrow">Prompt for Claude Code</p>
              <h2>
                {changes.removed} removed · {changes.edited} edited · {changes.added} new
              </h2>
              <p>Paste it into Claude Code in the alpsconference.com repository, or into the Slack thread that asks for the change.</p>
            </div>
            <textarea className="sg-prompt" readOnly value={prompt} onFocus={(event) => event.currentTarget.select()} />
            <div className="sg-dialog__actions">
              <button type="button" className="sg-btn sg-btn--accent" onClick={copyPrompt}>
                {copied ? <Check size={16} strokeWidth={1.75} aria-hidden="true" /> : <Copy size={16} strokeWidth={1.75} aria-hidden="true" />}
                {copied ? "Copied" : "Copy prompt"}
              </button>
              <button type="button" className="sg-btn" onClick={() => promptDialog.current?.close()}>
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>

      {typeof document !== "undefined" &&
        createPortal(
          <div className="sg-print" aria-hidden="true">
            {printJob?.signs.map((sign, index) => (
              // The page box carries the page name: Chrome ignores it on the sign itself, which is size-contained.
              <div key={`${sign.id}-${index}`} className={`sg-print__page ${sign.orientation === "landscape" ? "is-landscape" : ""}`}>
                <SignSheet sign={sign} lineArt={stored.lineArt} fontsReady={fontsReady} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
