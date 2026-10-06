import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { createPortal, flushSync } from "react-dom";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleQuestionMark,
  Settings2,
  ClipboardList,
  Copy,
  CopyPlus,
  Crosshair,
  DoorOpen,
  Eye,
  GraduationCap,
  HeartHandshake,
  Info,
  LayoutGrid,
  Mic,
  Moon,
  MoveRight,
  MoveUpRight,
  Pencil,
  Plus,
  Printer,
  QrCode,
  Recycle,
  Search,
  Signpost,
  Sparkles,
  Spline,
  Trash2,
  Undo2,
  UserRound,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  type LucideIcon,
} from "lucide-react";
import { buildSigns, SIGN_CATEGORIES, signName, type Sign } from "../../data/signage";
import { withBase } from "../../lib/withBase";
import { Card } from "./Card";
import { Editor } from "./Editor";
import { buildPrompt, changeCount, describeEdit } from "./prompt";
import { isLink } from "./qr";
import { BLANK_QR, QrTool, qrDraftToEdit, signToQrDraft, type QrDraft } from "./QrTool";
import { Particles, playBoom, playShot, pop, prefersReducedMotion, shake, shatter } from "./shooter";
import { Settings, type ResetKind } from "./Settings";
import { SignSheet } from "./SignSheet";
import {
  applyEdit,
  BLANK_DRAFT,
  copyText,
  diffEdit,
  draftToEdit,
  editableFields,
  EMPTY,
  expand,
  hasWords,
  matches,
  downloadText,
  EMPTY_UI,
  exportFile,
  importFile,
  readStored,
  readUi,
  signToDraft,
  writeStored,
  writeUi,
  type ArrowChoice,
  type Draft,
  type Stored,
  type Ui,
} from "./state";
import { cls, Compass, ICON, ICON_SM, Stepper, useModKey } from "./ui";

const CUSTOM = "custom";
const SELECTED = "selected";

const CATEGORY_ICON: Record<string, LucideIcon> = {
  all: LayoutGrid,
  [SELECTED]: Printer,
  [CUSTOM]: UserRound,
  welcome: DoorOpen,
  rooms: Signpost,
  workshops: GraduationCap,
  program: CalendarDays,
  experiences: Sparkles,
  signups: ClipboardList,
  food: UtensilsCrossed,
  evening: Moon,
  online: QrCode,
  info: Info,
  care: HeartHandshake,
  waste: Recycle,
  stage: Mic,
  arrows: MoveRight,
};

type PanelState = { kind: "sign" | "qr"; id: string | null } | null;
type Toast = { text: string; action?: { label: string; run: () => void } } | null;

const newId = () => `${CUSTOM}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const without = <T,>(record: Record<string, T>, key: string) => {
  const { [key]: _gone, ...rest } = record;
  return rest;
};
/** Text entry only: a focused checkbox or slider still lets the shortcuts through. */
const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(TEXTAREA|SELECT)$/.test(target.tagName) ||
    (target instanceof HTMLInputElement && !/^(checkbox|radio|range|button|submit|reset|color|file)$/.test(target.type)));

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

/* ------------------------------------------------------------------- page -- */

export default function SignagePage() {
  const library = useMemo(() => buildSigns(), []);
  const originals = useMemo(() => new Map(library.map((sign) => [sign.id, sign])), [library]);
  const [stored, setStored] = useState<Stored>(() => (typeof window === "undefined" ? EMPTY : readStored()));
  // Where you were last time: the view, the search and an open panel with its unsaved draft.
  const [initialUi] = useState<Ui>(() => (typeof window === "undefined" ? EMPTY_UI : readUi()));
  const [category, setCategory] = useState<string>(initialUi.category);
  const [query, setQuery] = useState(initialUi.query);
  const [shooter, setShooter] = useState(false);
  // `open` is false when the browser's own print shortcut started the job: its dialog is already on its way.
  const [printJob, setPrintJob] = useState<{ signs: Sign[]; open: boolean } | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [panel, setPanel] = useState<PanelState>(initialUi.panel);
  const [draft, setDraft] = useState<Draft>(() => ({ ...BLANK_DRAFT, ...initialUi.draft }) as Draft);
  const [qrDraft, setQrDraft] = useState<QrDraft>(() => ({ ...BLANK_QR, ...initialUi.qrDraft }) as QrDraft);
  const [compassId, setCompassId] = useState<string | null>(null);
  const [promptOpen, setPromptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ shots: 0, hits: 0 });
  const [toast, setToast] = useState<Toast>(null);
  const fontsReady = useFontsReady();
  const mod = useModKey();

  const mainRef = useRef<HTMLElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const promptDialog = useRef<HTMLDialogElement>(null);
  const particles = useRef<Particles | null>(null);
  const history = useRef<string[]>([]);
  const combo = useRef({ count: 0, at: 0 });
  const lastToggled = useRef<string | null>(null);
  const toastTimer = useRef(0);

  useEffect(() => writeStored(stored), [stored]);
  const ui = useMemo<Ui>(
    () => ({ category, query, panel, draft: panel?.kind === "sign" ? draft : null, qrDraft: panel?.kind === "qr" ? qrDraft : null }),
    [category, query, panel, draft, qrDraft],
  );
  useEffect(() => writeUi(ui), [ui]);
  // Browsers that cannot give a landscape sign its own landscape page get it turned onto a portrait one.
  const [namedPages] = useState(() => typeof CSS !== "undefined" && CSS.supports("page", "landscape"));
  const update = useCallback((fn: (prev: Stored) => Stored) => setStored(fn), []);

  const notify = useCallback((text: string, action?: NonNullable<Toast>["action"]) => {
    window.clearTimeout(toastTimer.current);
    setToast({ text, action });
    toastTimer.current = window.setTimeout(() => setToast(null), action ? 6000 : 2400);
  }, []);

  /* Signs as they will print: edits and arrow choices applied, your own signs first. */
  const customIds = useMemo(() => new Set(stored.added.map((sign) => sign.id)), [stored.added]);

  /** A sign with its edit and arrow choice; `hide` takes arrows off signs with words when they are switched off. */
  const resolve = useCallback(
    (sign: Sign, hide: boolean): Sign => {
      const edited = applyEdit(sign, stored.edits[sign.id]);
      const choice = stored.arrows[sign.id];
      let arrow = choice === undefined ? edited.arrow : choice === "none" ? undefined : choice;
      if (hide && !stored.showArrows && hasWords(edited)) arrow = undefined;
      return arrow === edited.arrow ? edited : { ...edited, arrow };
    },
    [stored.edits, stored.arrows, stored.showArrows],
  );

  const signs = useMemo(() => [...stored.added, ...library].map((sign) => resolve(sign, true)), [library, stored.added, resolve]);
  const byId = useMemo(() => new Map(signs.map((sign) => [sign.id, sign])), [signs]);
  const removedSet = useMemo(() => new Set(stored.removed), [stored.removed]);
  const sourceOf = useCallback((id: string) => originals.get(id) ?? stored.added.find((sign) => sign.id === id), [originals, stored.added]);

  const visible = useMemo(
    () =>
      signs.filter((sign) => {
        if (!matches(sign, query.trim())) return false;
        if (category === "all") return true;
        if (category === CUSTOM) return customIds.has(sign.id);
        if (category === SELECTED) return (stored.selection[sign.id] ?? 0) > 0 && !removedSet.has(sign.id);
        return !customIds.has(sign.id) && sign.category === category;
      }),
    [signs, query, category, customIds, stored.selection, removedSet],
  );

  const groups = useMemo(() => {
    const list: { id: string; label: string; hint?: string; signs: Sign[] }[] = [];
    const own = visible.filter((sign) => customIds.has(sign.id));
    if (own.length) list.push({ id: CUSTOM, label: "Your signs", hint: "Made, duplicated or generated here", signs: own });
    for (const group of SIGN_CATEGORIES) {
      const items = visible.filter((sign) => !customIds.has(sign.id) && sign.category === group.id);
      if (items.length) list.push({ id: group.id, label: group.label, hint: group.hint, signs: items });
    }
    return list;
  }, [visible, customIds]);

  /** Live signs in the order they show: for shift-click ranges and the preview's arrows. */
  const order = useMemo(() => groups.flatMap((group) => group.signs).filter((sign) => !removedSet.has(sign.id)), [groups, removedSet]);

  const keyOf = useCallback((sign: Sign) => (customIds.has(sign.id) ? CUSTOM : sign.category), [customIds]);
  const counts = useMemo(() => {
    const total: Record<string, number> = { all: 0, [CUSTOM]: 0 };
    const picked: Record<string, number> = {};
    for (const sign of signs) {
      if (removedSet.has(sign.id)) continue;
      const key = keyOf(sign);
      total.all += 1;
      total[key] = (total[key] ?? 0) + 1;
      if ((stored.selection[sign.id] ?? 0) > 0) picked[key] = (picked[key] ?? 0) + 1;
    }
    return { total, picked };
  }, [signs, removedSet, keyOf, stored.selection]);

  const selectionList = useMemo(
    () =>
      signs
        .filter((sign) => (stored.selection[sign.id] ?? 0) > 0 && !removedSet.has(sign.id))
        .map((sign) => ({ sign, copies: stored.selection[sign.id] })),
    [signs, stored.selection, removedSet],
  );
  useEffect(() => {
    if (panel?.id && !byId.has(panel.id)) setPanel(null);
  }, [panel, byId]);

  // An emptied "To print" or "Your signs" view goes back to everything.
  useEffect(() => {
    if ((category === SELECTED && !selectionList.length) || (category === CUSTOM && !stored.added.length)) setCategory("all");
  }, [category, selectionList.length, stored.added.length]);

  const pageCount = selectionList.reduce((sum, item) => sum + item.copies, 0);
  const landscapeCount = selectionList.reduce((sum, item) => sum + (item.sign.orientation === "landscape" ? item.copies : 0), 0);

  const presets = useMemo(() => {
    const seen = new Map<string, string>();
    for (const sign of library) if (sign.qr && isLink(sign.qr.url) && !seen.has(sign.qr.url)) seen.set(sign.qr.url, signName(sign));
    return [...seen].map(([url, label]) => ({ url, label }));
  }, [library]);

  /* ------------------------------------------------------------ actions -- */

  const setCopies = useCallback(
    (id: string, copies: number) =>
      update((prev) => ({ ...prev, selection: copies > 0 ? { ...prev.selection, [id]: copies } : without(prev.selection, id) })),
    [update],
  );

  const orderRef = useRef(order);
  orderRef.current = order;
  const toggle = useCallback(
    (id: string, on: boolean, range: boolean) => {
      const ids = orderRef.current.map((sign) => sign.id);
      const from = range && lastToggled.current ? ids.indexOf(lastToggled.current) : -1;
      const to = ids.indexOf(id);
      const targets = from >= 0 && to >= 0 ? ids.slice(Math.min(from, to), Math.max(from, to) + 1) : [id];
      lastToggled.current = id;
      update((prev) => {
        const selection = { ...prev.selection };
        for (const target of targets) {
          if (on) selection[target] = selection[target] || 1;
          else delete selection[target];
        }
        return { ...prev, selection };
      });
    },
    [update],
  );

  const setArrow = useCallback(
    (id: string, choice: ArrowChoice) =>
      update((prev) => {
        const source = originals.get(id) ?? prev.added.find((sign) => sign.id === id);
        if (!source) return prev;
        const base = applyEdit(source, prev.edits[id]).arrow ?? "none";
        return { ...prev, arrows: choice === base ? without(prev.arrows, id) : { ...prev.arrows, [id]: choice } };
      }),
    [update, originals],
  );

  /** Opens a sign in the inspector: QR signs in the QR generator, the rest in the editor. */
  const editSign = useCallback((sign: Sign | null) => {
    previewDialog.current?.close();
    setCompassId(null);
    if (!sign) {
      setDraft(BLANK_DRAFT);
      setPanel({ kind: "sign", id: null });
    } else if (sign.layout === "qr") {
      setQrDraft(signToQrDraft(sign));
      setPanel({ kind: "qr", id: sign.id });
    } else {
      setDraft(signToDraft(sign));
      setPanel({ kind: "sign", id: sign.id });
    }
  }, []);

  const openEditor = useCallback(
    (id: string | null) => {
      const source = id ? sourceOf(id) : undefined;
      editSign(source ? resolve(source, false) : null);
    },
    [sourceOf, resolve, editSign],
  );

  const openQr = useCallback(() => {
    previewDialog.current?.close();
    setQrDraft(BLANK_QR);
    setPanel({ kind: "qr", id: null });
  }, []);

  const closePanel = useCallback(() => setPanel(null), []);

  const duplicate = useCallback(
    (id: string) => {
      const source = sourceOf(id);
      if (!source) return;
      const { derived: _derived, ...copy } = resolve(source, false);
      const sign: Sign = { ...copy, id: newId() };
      update((prev) => ({ ...prev, added: [...prev.added, sign], selection: { ...prev.selection, [sign.id]: prev.selection[id] || 1 } }));
      notify(`Duplicated “${signName(sign)}” into your signs`);
      editSign(sign);
    },
    [sourceOf, resolve, update, notify, editSign],
  );

  /** Saves the open panel: a new sign, a change to one of yours, or an edit of a library sign. */
  const save = () => {
    if (!panel) return;
    const edit = panel.kind === "qr" ? qrDraftToEdit(qrDraft) : draftToEdit(draft);
    const { id } = panel;
    if (!id) {
      const sign = applyEdit({ id: newId(), category: panel.kind === "qr" ? "online" : "arrows", title: "" }, edit);
      update((prev) => ({ ...prev, added: [...prev.added, sign], selection: { ...prev.selection, [sign.id]: 1 } }));
      notify(`Added “${signName(sign)}” to your signs, ticked for printing`);
    } else if (customIds.has(id)) {
      update((prev) => ({ ...prev, added: prev.added.map((sign) => (sign.id === id ? applyEdit(sign, edit) : sign)), arrows: without(prev.arrows, id) }));
      notify("Saved");
    } else {
      const original = originals.get(id);
      if (!original) return;
      const diff = diffEdit(original, edit, editableFields(original, false));
      const base = applyEdit(original, diff).arrow ?? "none";
      const choice: ArrowChoice = panel.kind === "sign" ? draft.arrow || "none" : base;
      update((prev) => ({
        ...prev,
        edits: Object.keys(diff).length ? { ...prev.edits, [id]: diff } : without(prev.edits, id),
        arrows: choice === base ? without(prev.arrows, id) : { ...prev.arrows, [id]: choice },
      }));
      notify(Object.keys(diff).length ? "Saved: the change goes into the prompt" : "Saved");
    }
    setPanel(null);
  };

  const revert = () => {
    const id = panel?.id;
    const original = id ? originals.get(id) : undefined;
    if (!id || !original) return;
    update((prev) => ({ ...prev, edits: without(prev.edits, id), arrows: without(prev.arrows, id) }));
    if (panel?.kind === "qr") setQrDraft(signToQrDraft(original));
    else setDraft(signToDraft(original));
    notify("Back to the original");
  };

  const removeCustom = () => {
    const id = panel?.id;
    const sign = id ? stored.added.find((entry) => entry.id === id) : undefined;
    if (!id || !sign) return;
    const index = stored.added.indexOf(sign);
    const copies = stored.selection[id];
    update((prev) => ({ ...prev, added: prev.added.filter((entry) => entry.id !== id), selection: without(prev.selection, id), arrows: without(prev.arrows, id) }));
    setPanel(null);
    notify(`Deleted “${signName(sign)}”`, {
      label: "Undo",
      run: () =>
        update((prev) => {
          const added = [...prev.added];
          added.splice(index, 0, sign);
          return { ...prev, added, selection: copies ? { ...prev.selection, [id]: copies } : prev.selection };
        }),
    });
  };

  const restore = useCallback(
    (id: string) => {
      history.current = history.current.filter((entry) => entry !== id);
      update((prev) => ({ ...prev, removed: prev.removed.filter((entry) => entry !== id) }));
    },
    [update],
  );

  const openPreview = useCallback((id: string) => {
    setCompassId(null);
    setPreviewId(id);
    requestAnimationFrame(() => {
      if (!previewDialog.current?.open) previewDialog.current?.showModal();
    });
  }, []);

  const step = (delta: number) => {
    if (!previewId || !order.length) return;
    const index = order.findIndex((sign) => sign.id === previewId);
    const next = order[(index + delta + order.length) % order.length];
    if (next) setPreviewId(next.id);
  };

  const selectGroup = (live: Sign[], all: boolean) =>
    update((prev) => {
      const selection = { ...prev.selection };
      for (const sign of live) {
        if (all) delete selection[sign.id];
        else selection[sign.id] = selection[sign.id] || 1;
      }
      return { ...prev, selection };
    });

  /* --------------------------------------------------------------- print -- */

  const print = useCallback((list: { sign: Sign; copies: number }[]) => {
    if (!list.length) return;
    setPrintJob({ signs: expand(list), open: true });
  }, []);

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

  /* ----------------------------------------------------------- keyboard -- */

  const keys = useRef({ openEditor, openQr, closePanel, panel, compassId, query });
  keys.current = { openEditor, openQr, closePanel, panel, compassId, query };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const k = keys.current;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (document.querySelector("dialog[open]")) return;
      if (event.key === "Escape") {
        if (k.compassId) setCompassId(null);
        else if (isTyping(event.target) && event.target === searchRef.current) {
          if (k.query) setQuery("");
          searchRef.current?.blur();
        } else if (k.panel && !document.querySelector(":popover-open")) k.closePanel();
        return;
      }
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "/") {
        event.preventDefault();
        searchRef.current?.focus();
      } else if (event.key === "n") {
        event.preventDefault();
        k.openEditor(null);
      } else if (event.key === "q") {
        event.preventDefault();
        k.openQr();
      } else if (event.key === "?") {
        helpRef.current?.togglePopover();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A click anywhere else closes a card's compass.
  useEffect(() => {
    if (!compassId) return;
    const onDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".sg-card__compass, .sg-tool[aria-expanded='true']")) setCompassId(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [compassId]);

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
        if (mainRef.current) shake(mainRef.current);
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
      update((prev) => ({
        ...prev,
        removed: prev.removed.includes(id) ? prev.removed : [...prev.removed, id],
        selection: without(prev.selection, id),
      }));
    },
    [byId, stored.muted, stored.removed, update, library, customIds],
  );

  const miss = (event: ReactMouseEvent<HTMLElement>) => {
    if (!shooter) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, a, input, select, textarea, label, .sg-wreck, .sg-group__head")) return;
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

  /* -------------------------------------------------------------- prompt -- */

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

  const viewPrompt = () => {
    setPromptOpen(true);
    requestAnimationFrame(() => promptDialog.current?.showModal());
  };

  const copyPrompt = async () => {
    if (!(await copyText(prompt))) return viewPrompt();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  /* ------------------------------------------------------------ settings -- */

  /** Applies a change to what is stored and offers to take it back. */
  const withUndo = (text: string, fn: (prev: Stored) => Stored) => {
    const before = stored;
    update(fn);
    notify(text, { label: "Undo", run: () => setStored(before) });
  };

  const viewChanged =
    stored.lineArt !== EMPTY.lineArt || stored.showArrows !== EMPTY.showArrows || stored.cardSize !== EMPTY.cardSize || stored.muted !== EMPTY.muted || stored.turnLandscape !== EMPTY.turnLandscape;
  const resetCounts: Record<ResetKind, number> = {
    selection: selectionList.length,
    edits: Object.keys(stored.edits).length,
    added: stored.added.length,
    arrows: Object.keys(stored.arrows).length,
    removed: stored.removed.length,
    view: viewChanged || category !== "all" ? 1 : 0,
  };

  const reset = (kind: ResetKind) => {
    if (kind === "selection") withUndo("Unticked every sign", (prev) => ({ ...prev, selection: {} }));
    if (kind === "edits") withUndo("Edits undone: the signs are back to the original", (prev) => ({ ...prev, edits: {} }));
    if (kind === "arrows") withUndo("Arrows back to where they were", (prev) => ({ ...prev, arrows: {} }));
    if (kind === "removed") {
      history.current = [];
      withUndo("Blasted signs are back", (prev) => ({ ...prev, removed: [] }));
    }
    if (kind === "added") {
      setPanel((open) => (open?.id && customIds.has(open.id) ? null : open));
      withUndo("Your signs are deleted", (prev) => {
        const own = new Set(prev.added.map((sign) => sign.id));
        const keep = <T,>(record: Record<string, T>) => Object.fromEntries(Object.entries(record).filter(([id]) => !own.has(id)));
        return { ...prev, added: [], selection: keep(prev.selection), arrows: keep(prev.arrows), removed: prev.removed.filter((id) => !own.has(id)) };
      });
    }
    if (kind === "view") {
      setCategory("all");
      withUndo("View back to the defaults", (prev) => ({
        ...prev,
        lineArt: EMPTY.lineArt,
        showArrows: EMPTY.showArrows,
        cardSize: EMPTY.cardSize,
        muted: EMPTY.muted,
        turnLandscape: EMPTY.turnLandscape,
      }));
    }
  };

  const resetAll = () => {
    if (!window.confirm("Reset everything this browser keeps for the signage: ticks, edits, your signs, arrows, blasts and the view?")) return;
    const before = { stored, ui };
    settingsRef.current?.hidePopover();
    history.current = [];
    setStored(EMPTY);
    setCategory(EMPTY_UI.category);
    setQuery(EMPTY_UI.query);
    setPanel(null);
    notify("Everything is reset", {
      label: "Undo",
      run: () => {
        setStored(before.stored);
        setCategory(before.ui.category);
        setQuery(before.ui.query);
      },
    });
  };

  const exportState = () => {
    downloadText(exportFile(stored, ui), `alps-signage-${new Date().toISOString().slice(0, 10)}.json`);
    notify("Settings downloaded");
  };

  const importState = async (file: File) => {
    try {
      const { stored: next, ui: nextUi } = importFile(await file.text());
      const summary = [
        `${Object.keys(next.selection).length} ticked`,
        `${Object.keys(next.edits).length} edited`,
        `${next.added.length} of your own`,
        `${next.removed.length} blasted`,
      ].join(", ");
      if (!window.confirm(`Replace what this browser keeps with “${file.name}”?\n\n${summary}.`)) return;
      const before = { stored, ui };
      settingsRef.current?.hidePopover();
      history.current = [];
      setStored(next);
      setPanel(null);
      if (nextUi) {
        setCategory(nextUi.category);
        setQuery(nextUi.query);
      }
      notify(`Imported ${file.name}`, {
        label: "Undo",
        run: () => {
          setStored(before.stored);
          setCategory(before.ui.category);
          setQuery(before.ui.query);
        },
      });
    } catch (error) {
      notify(error instanceof Error ? error.message : "This file could not be read.");
    }
  };

  /* ------------------------------------------------------------ previews -- */

  const editorPreview = useMemo(() => {
    if (!panel) return null;
    const hide = (sign: Sign) => (!stored.showArrows && hasWords(sign) ? { ...sign, arrow: undefined } : sign);
    const edit = panel.kind === "qr" ? qrDraftToEdit(qrDraft) : draftToEdit(draft);
    const original = panel.id ? originals.get(panel.id) : undefined;
    if (original && !customIds.has(original.id)) {
      const edited = applyEdit(original, diffEdit(original, edit, editableFields(original, false)));
      return hide(panel.kind === "sign" ? { ...edited, arrow: draft.arrow || undefined } : edited);
    }
    const base = (panel.id && stored.added.find((sign) => sign.id === panel.id)) || { id: "draft", category: panel.kind === "qr" ? ("online" as const) : ("arrows" as const), title: "" };
    return hide(applyEdit(base, edit));
  }, [panel, draft, qrDraft, originals, customIds, stored.added, stored.showArrows]);

  const panelBase = panel?.id ? byId.get(panel.id) ?? null : null;
  const panelCustom = Boolean(panel?.id && customIds.has(panel.id));
  const panelHasEdit = Boolean(panel?.id && (stored.edits[panel.id] || stored.arrows[panel.id]));
  const previewSign = previewId ? byId.get(previewId) : undefined;
  const previewIndex = previewSign ? order.findIndex((sign) => sign.id === previewSign.id) : -1;
  const accuracy = stats.shots ? Math.round((stats.hits / stats.shots) * 100) : 100;

  const sidebar = [
    { id: "all", label: "All signs" },
    ...(selectionList.length ? [{ id: SELECTED, label: "To print" }] : []),
    ...(counts.total[CUSTOM] ? [{ id: CUSTOM, label: "Your signs" }] : []),
  ];
  const countFor = (id: string) => (id === SELECTED ? selectionList.length : counts.total[id] ?? 0);

  /* -------------------------------------------------------------- render -- */

  return (
    <div className={cls("sg", panel && "has-panel")} data-shooter={shooter ? "on" : "off"}>
      <header className="sg-top">
        <div className="sg-brand">
          <img src={withBase("img/logo.png")} alt="ALPS" width={753} height={306} />
          <h1>Signage</h1>
        </div>

        <label className="sg-search">
          <Search {...ICON_SM} />
          <span className="sr-only">Search signs</span>
          <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search signs" />
          {!query && <kbd>/</kbd>}
        </label>

        <div className="sg-top__group" role="group" aria-label="View">
          <button
            type="button"
            className="sg-toggle"
            aria-pressed={stored.lineArt}
            onClick={() => update((prev) => ({ ...prev, lineArt: !prev.lineArt }))}
            title="Line art from the booklet"
          >
            <Spline {...ICON} />
            <span>Line art</span>
          </button>
          <button
            type="button"
            className="sg-toggle"
            aria-pressed={stored.showArrows}
            onClick={() => update((prev) => ({ ...prev, showArrows: !prev.showArrows }))}
            title={stored.showArrows ? "Take the arrows off every sign with words" : "Put the arrows back"}
          >
            <MoveUpRight {...ICON} />
            <span>Arrows</span>
          </button>
          <label className="sg-zoom" title="Card size">
            <ZoomIn {...ICON_SM} />
            <span className="sr-only">Card size</span>
            <input
              type="range"
              min={140}
              max={360}
              step={10}
              value={stored.cardSize}
              onChange={(event) => update((prev) => ({ ...prev, cardSize: Number(event.target.value) }))}
            />
          </label>
        </div>

        <div className="sg-top__group" role="group" aria-label="Create">
          <button type="button" className="sg-btn sg-btn--small" onClick={() => openEditor(null)} title="New sign (N)">
            <Plus {...ICON_SM} />
            <span>Sign</span>
          </button>
          <button type="button" className="sg-btn sg-btn--small" onClick={openQr} title="QR code generator (Q)">
            <QrCode {...ICON_SM} />
            <span>QR code</span>
          </button>
        </div>

        <button
          type="button"
          className="sg-btn sg-btn--primary sg-btn--small sg-print-btn"
          disabled={!pageCount}
          onClick={() => print(selectionList)}
          title={pageCount ? `Print ${pageCount} ${pageCount === 1 ? "page" : "pages"} (${mod}P)` : "Tick signs to print them"}
        >
          <Printer {...ICON_SM} />
          <span>Print</span>
          {pageCount > 0 && <span className="sg-count">{pageCount}</span>}
        </button>
      </header>

      <nav className="sg-side" aria-label="Categories">
        <ul>
          {sidebar.map((item) => (
            <SideItem key={item.id} id={item.id} label={item.label} count={countFor(item.id)} active={category === item.id} onPick={setCategory} />
          ))}
        </ul>
        <p className="sg-side__head">Categories</p>
        <ul>
          {SIGN_CATEGORIES.map((item) => (
            <SideItem key={item.id} id={item.id} label={item.label} count={countFor(item.id)} picked={counts.picked[item.id]} active={category === item.id} onPick={setCategory} />
          ))}
        </ul>
      </nav>

      <main className="sg-main" ref={mainRef} onClick={miss} style={{ "--card": `${stored.cardSize}px` } as React.CSSProperties}>
        <div className="sg-chips" role="group" aria-label="Categories">
          {[...sidebar, ...SIGN_CATEGORIES].map((chip) => (
            <button key={chip.id} type="button" className="sg-chip" aria-pressed={category === chip.id} onClick={() => setCategory(chip.id)}>
              {chip.label}
              <span>{countFor(chip.id)}</span>
            </button>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="sg-empty">
            <p>{query ? `No sign matches “${query}”.` : "Nothing here yet."}</p>
            {query && (
              <button type="button" className="sg-btn sg-btn--small" onClick={() => setQuery("")}>
                Clear the search
              </button>
            )}
          </div>
        )}
        {groups.map((group) => {
          const live = group.signs.filter((sign) => !removedSet.has(sign.id));
          const allSelected = live.length > 0 && live.every((sign) => (stored.selection[sign.id] ?? 0) > 0);
          return (
            <section key={group.id} className="sg-group" aria-labelledby={`group-${group.id}`}>
              <div className="sg-group__head">
                <h2 id={`group-${group.id}`}>{group.label}</h2>
                {group.hint && <p>{group.hint}</p>}
                {live.length > 0 && (
                  <button type="button" className="sg-linkbtn" onClick={() => selectGroup(live, allSelected)}>
                    {allSelected ? "Untick all" : `Tick all ${live.length}`}
                  </button>
                )}
              </div>
              <div className="sg-grid">
                {group.signs.map((sign) => (
                  <Card
                    key={sign.id}
                    sign={sign}
                    copies={stored.selection[sign.id] ?? 0}
                    edited={Boolean(stored.edits[sign.id] && originals.has(sign.id) && describeEdit(originals.get(sign.id)!, stored.edits[sign.id]).length)}
                    custom={customIds.has(sign.id)}
                    removed={removedSet.has(sign.id)}
                    editing={panel?.id === sign.id}
                    arrowTool={(sign.layout ?? "statement") === "statement" && (stored.showArrows || !hasWords(sign))}
                    compassOpen={compassId === sign.id}
                    lineArt={stored.lineArt}
                    fontsReady={fontsReady}
                    onToggle={toggle}
                    onCopies={setCopies}
                    onArrow={setArrow}
                    onCompass={setCompassId}
                    onEdit={openEditor}
                    onDuplicate={duplicate}
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

      {panel?.kind === "sign" && editorPreview && (
        <Editor
          key={panel.id ?? "new"}
          base={panelBase}
          custom={panelCustom}
          fields={editableFields(panel.id ? sourceOf(panel.id) ?? null : null, panelCustom)}
          draft={draft}
          setDraft={setDraft}
          preview={editorPreview}
          hasEdit={panelHasEdit}
          arrowsHidden={!stored.showArrows}
          lineArt={stored.lineArt}
          fontsReady={fontsReady}
          onSave={save}
          onRevert={revert}
          onDelete={removeCustom}
          onPrint={(sign) => print([{ sign, copies: 1 }])}
          onClose={closePanel}
        />
      )}
      {panel?.kind === "qr" && editorPreview && (
        <QrTool
          key={panel.id ?? "new"}
          base={panelBase}
          custom={panelCustom}
          draft={qrDraft}
          setDraft={setQrDraft}
          preview={editorPreview}
          presets={presets}
          hasEdit={panelHasEdit}
          fontsReady={fontsReady}
          onSave={save}
          onRevert={revert}
          onDelete={removeCustom}
          onPrint={(sign) => print([{ sign, copies: 1 }])}
          onClose={closePanel}
        />
      )}

      <footer className={cls("sg-status", shooter && "is-shooter")}>
        {shooter ? (
          <>
            <div className="sg-hud" aria-live="polite">
              <Crosshair {...ICON_SM} className="sg-hud__icon" />
              <span className="sg-hud__stat sg-hud__stat--accent">
                <strong>{changes.removed}</strong> blasted
              </span>
              <span className="sg-hud__stat">
                <strong>{counts.total.all}</strong> left
              </span>
              <span className="sg-hud__stat">
                <strong>{accuracy}%</strong> accuracy
              </span>
              {changes.edited + changes.added > 0 && (
                <span className="sg-hud__stat">
                  <strong>{changes.edited + changes.added}</strong> edited or new
                </span>
              )}
            </div>
            <div className="sg-status__actions">
              <button type="button" className="sg-icon-btn" onClick={() => update((prev) => ({ ...prev, muted: !prev.muted }))} aria-label={stored.muted ? "Sound on" : "Sound off"} title={stored.muted ? "Sound on" : "Sound off"}>
                {stored.muted ? <VolumeX {...ICON_SM} /> : <Volume2 {...ICON_SM} />}
              </button>
              <button type="button" className="sg-btn sg-btn--tiny" onClick={undo} disabled={!stored.removed.length}>
                <Undo2 {...ICON_SM} />
                Undo
              </button>
              <button type="button" className="sg-btn sg-btn--tiny" onClick={resetBlasts} disabled={!stored.removed.length}>
                <Trash2 {...ICON_SM} />
                Reset
              </button>
              <button type="button" className="sg-btn sg-btn--tiny" onClick={viewPrompt}>
                <Eye {...ICON_SM} />
                Prompt
              </button>
              <button type="button" className="sg-btn sg-btn--tiny sg-btn--accent" onClick={copyPrompt}>
                {copied ? <Check {...ICON_SM} /> : <Copy {...ICON_SM} />}
                {copied ? "Copied" : "Copy prompt"}
              </button>
              <button type="button" className="sg-icon-btn" onClick={() => setShooter(false)} aria-label="Leave shooter mode" title="Leave shooter mode">
                <X {...ICON_SM} />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="sg-status__info">
              <button type="button" className="sg-status__btn" popoverTarget="sg-help" title="Help and shortcuts (?)">
                <CircleQuestionMark {...ICON_SM} />
                <span>Help</span>
              </button>
              <button type="button" className="sg-status__btn" popoverTarget="sg-settings" title="Saved settings, backup and reset">
                <Settings2 {...ICON_SM} />
                <span>Settings</span>
              </button>
              <span className="sg-status__sep" aria-hidden="true" />
              <span aria-live="polite">
                {pageCount ? (
                  <>
                    <strong>{selectionList.length}</strong> {selectionList.length === 1 ? "sign" : "signs"} · <strong>{pageCount}</strong>{" "}
                    {pageCount === 1 ? "page" : "pages"}
                    {landscapeCount > 0 && <span className="sg-status__muted"> ({landscapeCount} landscape)</span>}
                  </>
                ) : (
                  <span className="sg-status__muted">{counts.total.all} signs · tick the ones to print</span>
                )}
              </span>
              {pageCount > 0 && (
                <button type="button" className="sg-status__btn" onClick={() => update((prev) => ({ ...prev, selection: {} }))}>
                  Clear
                </button>
              )}
            </div>
            <div className="sg-status__actions">
              {changeTotal > 0 && (
                <button type="button" className="sg-status__btn" onClick={viewPrompt} title="A prompt for Claude Code with your removals, edits and new signs">
                  <Eye {...ICON_SM} />
                  Prompt · {changeTotal} {changeTotal === 1 ? "change" : "changes"}
                </button>
              )}
              <button
                type="button"
                className="sg-status__btn sg-status__btn--accent"
                onClick={() => {
                  setShooter(true);
                  setStats({ shots: 0, hits: 0 });
                }}
                title="Blast the signs we won’t use"
              >
                <Crosshair {...ICON_SM} />
                Shooter mode
              </button>
            </div>
          </>
        )}
      </footer>

      {toast && (
        <div className="sg-toast" role="status">
          <span>{toast.text}</span>
          {toast.action && (
            <button
              type="button"
              onClick={() => {
                toast.action?.run();
                setToast(null);
              }}
            >
              {toast.action.label}
            </button>
          )}
        </div>
      )}

      <div id="sg-help" ref={helpRef} popover="auto" className="sg-help">
        <HelpContent mod={mod} />
      </div>

      <div id="sg-settings" ref={settingsRef} popover="auto" className="sg-help sg-settings">
        <Settings
          counts={resetCounts}
          pages={pageCount}
          turnLandscape={stored.turnLandscape}
          namedPages={namedPages}
          onTurn={(on) => update((prev) => ({ ...prev, turnLandscape: on }))}
          onReset={reset}
          onResetAll={resetAll}
          onExport={exportState}
          onImport={importState}
        />
      </div>

      {shooter && <canvas ref={fxRef} className="sg-fx" aria-hidden="true" />}

      <dialog
        ref={previewDialog}
        className="sg-dialog"
        onClose={() => setPreviewId(null)}
        onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
        onKeyDown={(event) => {
          if (isTyping(event.target)) return;
          if (event.key === "ArrowLeft") step(-1);
          else if (event.key === "ArrowRight") step(1);
          else if (event.key === "e" && previewSign) openEditor(previewSign.id);
        }}
      >
        {previewSign && (
          <div className="sg-dialog__inner">
            <div className={cls("sg-dialog__sheet", previewSign.orientation === "landscape" && "is-landscape")}>
              <SignSheet sign={previewSign} lineArt={stored.lineArt} fontsReady={fontsReady} />
            </div>
            <div className="sg-dialog__side">
              <div className="sg-dialog__nav">
                <button type="button" className="sg-icon-btn" onClick={() => step(-1)} aria-label="Previous sign" title="Previous (←)">
                  <ChevronLeft {...ICON} />
                </button>
                <span>
                  {previewIndex + 1} / {order.length}
                </span>
                <button type="button" className="sg-icon-btn" onClick={() => step(1)} aria-label="Next sign" title="Next (→)">
                  <ChevronRight {...ICON} />
                </button>
                <span className="sg-spacer" />
                <button type="button" className="sg-icon-btn" onClick={() => previewDialog.current?.close()} aria-label="Close" title="Close (Esc)">
                  <X {...ICON} />
                </button>
              </div>
              <div>
                <p className="sg-kicker">{customIds.has(previewSign.id) ? "Your signs" : SIGN_CATEGORIES.find((entry) => entry.id === previewSign.category)?.label}</p>
                <h2>{signName(previewSign)}</h2>
                <p className="sg-dialog__meta">
                  {previewSign.orientation === "landscape" ? "A4 landscape" : "A4 portrait"}
                  {previewSign.tiles && previewSign.tiles > 1 ? ` · ${previewSign.tiles} cards to cut out` : ""} · <code>{previewSign.id}</code>
                </p>
                {previewSign.qr && <p className="sg-dialog__meta sg-dialog__url">QR code: {previewSign.qr.url}</p>}
              </div>
              <div className="sg-dialog__row">
                <label className="sg-checkline">
                  <input type="checkbox" checked={(stored.selection[previewSign.id] ?? 0) > 0} onChange={(event) => setCopies(previewSign.id, event.target.checked ? 1 : 0)} />
                  Print
                </label>
                {(stored.selection[previewSign.id] ?? 0) > 0 && (
                  <Stepper value={stored.selection[previewSign.id]} onChange={(value) => setCopies(previewSign.id, value)} label="Copies" />
                )}
              </div>
              {(previewSign.layout ?? "statement") === "statement" && (stored.showArrows || !hasWords(previewSign)) && (
                <div className="sg-dialog__row">
                  <span className="sg-field__label">Arrow</span>
                  <Compass value={previewSign.arrow ?? "none"} onChange={(choice) => setArrow(previewSign.id, choice)} />
                </div>
              )}
              <div className="sg-dialog__actions">
                <button type="button" className="sg-btn sg-btn--primary" onClick={() => print([{ sign: previewSign, copies: stored.selection[previewSign.id] || 1 }])}>
                  <Printer {...ICON} />
                  Print now
                </button>
                <button type="button" className="sg-btn" onClick={() => openEditor(previewSign.id)} title="Edit (E)">
                  <Pencil {...ICON} />
                  Edit
                </button>
                <button type="button" className="sg-btn" onClick={() => duplicate(previewSign.id)}>
                  <CopyPlus {...ICON} />
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>

      <dialog ref={promptDialog} className="sg-dialog sg-prompt-dialog" onClose={() => setPromptOpen(false)}>
        {promptOpen && (
          <div className="sg-dialog__inner">
            <div className="sg-dialog__nav">
              <div>
                <p className="sg-kicker">Prompt for Claude Code</p>
                <h2>
                  {changes.removed} removed · {changes.edited} edited · {changes.added} new
                </h2>
              </div>
              <span className="sg-spacer" />
              <button type="button" className="sg-icon-btn" onClick={() => promptDialog.current?.close()} aria-label="Close">
                <X {...ICON} />
              </button>
            </div>
            <p className="sg-dialog__meta">Paste it into Claude Code in the alpsconference.com repository, or into the Slack thread that asks for the change.</p>
            <textarea className="sg-prompt" readOnly value={prompt} onFocus={(event) => event.currentTarget.select()} />
            <div className="sg-dialog__actions">
              <button type="button" className="sg-btn sg-btn--accent" onClick={copyPrompt}>
                {copied ? <Check {...ICON} /> : <Copy {...ICON} />}
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
              <div
                key={`${sign.id}-${index}`}
                className={cls("sg-print__page", sign.orientation === "landscape" && (stored.turnLandscape || !namedPages ? "is-turned" : "is-landscape"))}
              >
                <SignSheet sign={sign} lineArt={stored.lineArt} fontsReady={fontsReady} />
              </div>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* --------------------------------------------------------------- sidebar -- */

function SideItem({ id, label, count, picked, active, onPick }: { id: string; label: string; count: number; picked?: number; active: boolean; onPick: (id: string) => void }) {
  const Icon = CATEGORY_ICON[id] ?? LayoutGrid;
  return (
    <li>
      <button type="button" className="sg-side__item" aria-current={active ? "true" : undefined} onClick={() => onPick(id)}>
        <Icon {...ICON_SM} />
        <span className="sg-side__label">{label}</span>
        {picked ? (
          <span className="sg-side__picked" title={`${picked} ticked to print`}>
            {picked}
          </span>
        ) : null}
        <span className="sg-side__count">{count}</span>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ help -- */

function HelpContent({ mod }: { mod: string }) {
  const shortcuts: [string, string][] = [
    ["/", "Search"],
    ["N", "New sign"],
    ["Q", "QR code generator"],
    [`${mod} P`, "Print what is ticked"],
    ["Shift-click", "Tick a range"],
    ["← →", "Previous and next in the preview"],
    ["E", "Edit the sign in the preview"],
    ["Esc", "Close the panel"],
    ["?", "This help"],
  ];
  return (
    <>
      <p className="sg-kicker">ALPS Conference 2026 · on-site signage</p>
      <h2>Print-ready A4 signs for the Kultur &amp; Kongresshaus Aarau</h2>
      <p>
        Wayfinding with the numbers from the venue map, door signs for every experience, buffet menus, QR codes to the attendee pages
        and the time signals for the stage. Black on white with the booklet’s line art, so they print on any office printer.
      </p>
      <ol className="sg-help__steps">
        <li>
          <strong>Tick, then print.</strong> Pick the signs and copies, then press Print. In the dialog choose A4 at 100% (in
          Chrome, margins none), or save as PDF for the print shop. Landscape signs can come out turned onto portrait sheets: see
          Settings.
        </li>
        <li>
          <strong>Point the arrows.</strong> The arrow button on a card turns the arrow, or takes it off. Arrows in the toolbar takes
          them off every sign with words. Both change only your print.
        </li>
        <li>
          <strong>Edit, duplicate or make your own.</strong> Reword any sign, or duplicate one to print it with a different arrow. The
          program, menus and experience times come straight from the conference data.
        </li>
        <li>
          <strong>QR codes.</strong> Make a code for a link, a wifi network or any text: as one large sign, as cards to cut out, or as
          SVG and PNG files.
        </li>
      </ol>
      <dl className="sg-help__keys">
        {shortcuts.map(([key, label]) => (
          <div key={key}>
            <dt>
              <kbd>{key}</kbd>
            </dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
      <p className="sg-help__foot">
        Ticks, edits, your own signs and the view stay in this browser; Settings backs them up as a JSON file, imports one or resets
        them. Shooter mode blasts the signs we won’t use and turns every removal, edit and new sign into a prompt for Claude Code that
        changes the generator for everyone. Source in <code>src/data/signage.ts</code>.
      </p>
    </>
  );
}
