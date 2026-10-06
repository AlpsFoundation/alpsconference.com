import type {
  Sign,
  SignArrow,
  SignArt,
  SignIcon,
  SignLayout,
  SignOrientation,
  SignRow,
  SignTiles,
} from "../../data/signage";
import { EDITABLE_FIELDS, same, type EditableField, type SignEdit } from "./prompt";
import { normaliseUrl, saveFile, shortUrl, type QrEcc } from "./qr";

/* ---------------------------------------------------------------- storage -- */

/** An arrow turned for printing, or taken off the sign. */
export type ArrowChoice = SignArrow | "none";

export type Stored = {
  removed: string[];
  edits: Record<string, SignEdit>;
  added: Sign[];
  selection: Record<string, number>;
  arrows: Record<string, ArrowChoice>;
  lineArt: boolean;
  /** Off: arrows come off every sign that has words on it. */
  showArrows: boolean;
  muted: boolean;
  /** Smallest card width in the grid, in px. */
  cardSize: number;
  /** Print landscape signs turned onto portrait sheets, so the whole job has one orientation. */
  turnLandscape: boolean;
};

const STORAGE_KEY = "alps-signage:v1";
export const EMPTY: Stored = {
  removed: [],
  edits: {},
  added: [],
  selection: {},
  arrows: {},
  lineArt: true,
  showArrows: true,
  muted: false,
  cardSize: 200,
  turnLandscape: false,
};

/** Where you were: the view, the search and an open panel with its unsaved draft. */
export type Ui = {
  category: string;
  query: string;
  panel: { kind: "sign" | "qr"; id: string | null } | null;
  draft: Record<string, unknown> | null;
  qrDraft: Record<string, unknown> | null;
};

const UI_KEY = "alps-signage:ui:v1";
export const EMPTY_UI: Ui = { category: "all", query: "", panel: null, draft: null, qrDraft: null };

// Per-viewer convenience only: what you picked, edited or blasted stays in this browser.
function read<T extends object>(key: string, fallback: T, clean: (value: unknown) => T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? clean(JSON.parse(raw)) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const readStored = () => read(STORAGE_KEY, EMPTY, cleanStored);
export const writeStored = (value: Stored) => write(STORAGE_KEY, value);
export const readUi = () => read(UI_KEY, EMPTY_UI, cleanUi);
export const writeUi = (value: Ui) => write(UI_KEY, value);

/* ------------------------------------------------------- import, export -- */

const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === "object" && !Array.isArray(value);
const ARROW_CHOICES = new Set(["none", "up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"]);

/** Keeps what has the right shape and drops the rest, so a hand-edited or older file cannot break the page. */
export function cleanStored(value: unknown): Stored {
  const v = isRecord(value) ? value : {};
  const bool = (key: keyof Stored) => (typeof v[key] === "boolean" ? (v[key] as boolean) : (EMPTY[key] as boolean));
  const entries = (key: string) => (isRecord(v[key]) ? Object.entries(v[key] as Record<string, unknown>) : []);
  return {
    removed: Array.isArray(v.removed) ? v.removed.filter((id): id is string => typeof id === "string") : [],
    edits: Object.fromEntries(entries("edits").filter(([, edit]) => isRecord(edit))) as Stored["edits"],
    added: Array.isArray(v.added)
      ? (v.added.filter((sign) => isRecord(sign) && typeof sign.id === "string" && typeof sign.title === "string" && typeof sign.category === "string") as Sign[])
      : [],
    selection: Object.fromEntries(
      entries("selection")
        .filter(([, copies]) => typeof copies === "number" && copies > 0)
        .map(([id, copies]) => [id, Math.min(Math.round(copies as number), 20)]),
    ),
    arrows: Object.fromEntries(entries("arrows").filter(([, choice]) => typeof choice === "string" && ARROW_CHOICES.has(choice))) as Stored["arrows"],
    lineArt: bool("lineArt"),
    showArrows: bool("showArrows"),
    muted: bool("muted"),
    cardSize: typeof v.cardSize === "number" ? Math.min(Math.max(Math.round(v.cardSize), 140), 360) : EMPTY.cardSize,
    turnLandscape: bool("turnLandscape"),
  };
}

export function cleanUi(value: unknown): Ui {
  const v = isRecord(value) ? value : {};
  const kind = isRecord(v.panel) ? v.panel.kind : null;
  const panel: Ui["panel"] = isRecord(v.panel) && (kind === "sign" || kind === "qr") ? { kind, id: typeof v.panel.id === "string" ? v.panel.id : null } : null;
  return {
    category: typeof v.category === "string" ? v.category : EMPTY_UI.category,
    query: typeof v.query === "string" ? v.query : "",
    panel,
    draft: isRecord(v.draft) ? v.draft : null,
    qrDraft: isRecord(v.qrDraft) ? v.qrDraft : null,
  };
}

export const EXPORT_APP = "alps-signage";

/** Everything this browser keeps, as one file to back up, move to another computer or hand to someone. */
export function exportFile(stored: Stored, ui: Ui) {
  return JSON.stringify({ app: EXPORT_APP, version: 1, exportedAt: new Date().toISOString(), state: stored, ui }, null, 2);
}

/** Reads an exported file. A bare copy of the stored state is accepted too. */
export function importFile(text: string): { stored: Stored; ui: Ui | null } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("This file is not JSON.");
  }
  if (!isRecord(data)) throw new Error("This file is not a signage settings file.");
  const wrapped = data.app === EXPORT_APP && isRecord(data.state);
  const state = wrapped ? data.state : data;
  if (!["removed", "edits", "added", "selection", "arrows"].some((key) => key in (state as Record<string, unknown>))) {
    throw new Error("This file is not a signage settings file.");
  }
  return { stored: cleanStored(state), ui: wrapped && isRecord(data.ui) ? cleanUi(data.ui) : null };
}

export const downloadText = (text: string, name: string) => saveFile(new Blob([text], { type: "application/json" }), name);

/* ------------------------------------------------------------------ edits -- */

/** Applies an edit, keeping a sign's other fields and the generated ones. `null` clears a field. */
export function applyEdit(sign: Sign, edit?: SignEdit): Sign {
  if (!edit) return sign;
  const next = { ...sign } as Record<string, unknown>;
  for (const [key, value] of Object.entries(edit)) {
    if (value === null) delete next[key];
    else if (value !== undefined) next[key] = value;
  }
  // Edits saved before captions were editable keep the caption written for the same link.
  if (edit.qr && sign.qr && edit.qr.caption === undefined && edit.qr.url === sign.qr.url) next.qr = { ...sign.qr, ...edit.qr };
  return next as Sign;
}

/**
 * What the editor may change on a sign. Lists, sheets and figures generated
 * from the program data stay with the data; only your own signs change layout.
 */
export function editableFields(base: Sign | null, custom: boolean): Set<EditableField> {
  if (!base || custom) return new Set(EDITABLE_FIELDS);
  const fields = new Set<EditableField>(EDITABLE_FIELDS);
  fields.delete("layout");
  // Arrows are a printing choice on library signs: they are kept with the arrow turns.
  fields.delete("arrow");
  if (base.derived) {
    fields.delete("rows");
    fields.delete("sheet");
    fields.delete("figure");
    fields.delete("tiles");
  }
  return fields;
}

/** Only the fields that differ from the sign, so an edit says exactly what changed. */
export function diffEdit(base: Sign, edit: SignEdit, fields: Set<EditableField>): SignEdit {
  const out: SignEdit = {};
  for (const field of fields) {
    if (!(field in edit)) continue;
    const value = edit[field];
    if (same(base[field], value)) continue;
    (out as Record<string, unknown>)[field] = value ?? null;
  }
  return out;
}

/* ----------------------------------------------------------------- drafts -- */

export type Draft = {
  layout: SignLayout;
  orientation: SignOrientation;
  eyebrow: string;
  title: string;
  subtitle: string;
  body: string;
  rows: string;
  icon: SignIcon | "";
  arrow: SignArrow | "";
  markers: string;
  qrUrl: string;
  qrLabel: string;
  qrCaption: string;
  ecc: QrEcc;
  tiles: SignTiles;
  sheetColumns: string;
  sheetRows: number;
  sheetSplit: boolean;
  figure: string;
  note: string;
  art: SignArt | "";
};

export const BLANK_DRAFT: Draft = {
  layout: "statement",
  orientation: "portrait",
  eyebrow: "",
  title: "",
  subtitle: "",
  body: "",
  rows: "",
  icon: "",
  arrow: "",
  markers: "",
  qrUrl: "",
  qrLabel: "",
  qrCaption: "",
  ecc: "M",
  tiles: 1,
  sheetColumns: "Name",
  sheetRows: 20,
  sheetSplit: false,
  figure: "",
  note: "",
  art: "synapse",
};

/**
 * Rows as text, one per line: `lead | label | detail | aside`. A line without
 * bars is just the label; a leading bar skips the left column.
 */
export function rowsToText(rows?: SignRow[]) {
  if (!rows?.length) return "";
  return rows
    .map((row) => {
      const cells = [row.lead ?? "", row.label, row.detail ?? "", row.aside ?? ""];
      while (cells.length > 2 && !cells[cells.length - 1]) cells.pop();
      return cells.length === 2 && !cells[0] ? row.label : cells.join(" | ");
    })
    .join("\n");
}

export function textToRows(text: string): SignRow[] | undefined {
  const rows = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line): SignRow => {
      if (!line.includes("|")) return { label: line };
      const [lead, label, detail, aside] = line.split("|").map((cell) => cell.trim());
      const row: SignRow = { label: label ?? "" };
      if (lead) row.lead = lead;
      if (detail) row.detail = detail;
      if (aside) row.aside = aside;
      return row;
    });
  return rows.length ? rows : undefined;
}

export function signToDraft(sign: Sign): Draft {
  return {
    layout: sign.layout ?? "statement",
    orientation: sign.orientation ?? "portrait",
    eyebrow: sign.eyebrow ?? "",
    title: sign.title,
    subtitle: sign.subtitle ?? "",
    body: (sign.body ?? []).join("\n\n"),
    rows: rowsToText(sign.rows),
    icon: sign.icon ?? "",
    arrow: sign.arrow ?? "",
    markers: (sign.markers ?? []).join(", "),
    qrUrl: sign.qr?.url ?? "",
    qrLabel: sign.qr?.label ?? "",
    qrCaption: sign.qr?.caption ?? "",
    ecc: sign.qr?.ecc ?? "M",
    tiles: sign.tiles ?? 1,
    sheetColumns: (sign.sheet?.columns ?? ["Name"]).join(", "),
    sheetRows: sign.sheet?.rows ?? 20,
    sheetSplit: sign.sheet?.split ?? false,
    figure: sign.figure ?? "",
    note: sign.note ?? "",
    art: sign.art ?? "",
  };
}

const orNull = (value: string) => value.trim() || null;

/** Every editable field from the draft. Fields that do not apply to the layout are cleared. */
export function draftToEdit(draft: Draft): SignEdit {
  const body = draft.body.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean);
  const markers = draft.markers
    .split(/[\s,]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  const url = normaliseUrl(draft.qrUrl);
  const columns = draft.sheetColumns.split(",").map((column) => column.trim()).filter(Boolean);
  const { layout } = draft;
  const words = layout !== "timer";
  return {
    layout: layout === "statement" ? null : layout,
    orientation: draft.orientation === "portrait" ? null : draft.orientation,
    eyebrow: words ? orNull(draft.eyebrow) : null,
    title: draft.title.trim(),
    subtitle: words ? orNull(draft.subtitle) : null,
    body: words && layout !== "sheet" && body.length ? body : null,
    rows: (layout === "statement" || layout === "schedule") ? textToRows(draft.rows) ?? null : null,
    icon: (layout === "statement" || layout === "sheet") && draft.icon ? draft.icon : null,
    arrow: layout === "statement" && draft.arrow ? draft.arrow : null,
    markers: words && markers.length ? markers : null,
    qr:
      url && layout !== "sheet" && layout !== "timer"
        ? {
            url,
            label: draft.qrLabel.trim() || shortUrl(url),
            caption: draft.qrCaption.trim(),
            ...(draft.ecc !== "M" ? { ecc: draft.ecc } : {}),
          }
        : null,
    tiles: layout === "qr" && draft.tiles > 1 ? draft.tiles : null,
    sheet:
      layout === "sheet"
        ? { columns: columns.length ? columns : ["Name"], rows: Math.min(Math.max(Math.round(draft.sheetRows) || 1, 1), 60), ...(draft.sheetSplit ? { split: true } : {}) }
        : null,
    figure: layout === "timer" ? orNull(draft.figure) : null,
    note: orNull(draft.note),
    art: draft.art || null,
  };
}

/* ---------------------------------------------------------------- helpers -- */

export const ARROW_LABEL: Record<SignArrow, string> = {
  up: "Up",
  "up-right": "Up right",
  right: "Right",
  "down-right": "Down right",
  down: "Down",
  "down-left": "Down left",
  left: "Left",
  "up-left": "Up left",
};

export const hasWords = (sign: Pick<Sign, "title" | "eyebrow" | "subtitle">) => Boolean(sign.title || sign.eyebrow || sign.subtitle);

/** One sheet per copy. */
export const expand = (list: { sign: Sign; copies: number }[]) =>
  list.flatMap(({ sign, copies }) => Array.from({ length: copies }, () => sign));

export function matches(sign: Sign, query: string) {
  if (!query) return true;
  const haystack = [sign.id, sign.name, sign.title, sign.eyebrow, sign.subtitle, sign.note, sign.qr?.label, ...(sign.body ?? []), ...(sign.rows ?? []).map((row) => row.label)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

export async function copyText(text: string) {
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
