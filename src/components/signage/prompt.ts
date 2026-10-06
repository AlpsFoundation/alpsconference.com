import { SIGN_CATEGORY_LABEL, signName, type Sign } from "../../data/signage";

/** The parts of a sign the generator lets you edit. */
export const EDITABLE_FIELDS = [
  "layout",
  "orientation",
  "eyebrow",
  "title",
  "subtitle",
  "body",
  "rows",
  "icon",
  "arrow",
  "markers",
  "qr",
  "tiles",
  "sheet",
  "figure",
  "note",
  "art",
] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];
/** `null` clears a field: unlike `undefined`, it survives the trip through localStorage. */
export type SignEdit = { [K in EditableField]?: Sign[K] | null };

// Stable, and blind to empty strings, so `{ caption: "" }` matches a QR code without one.
export const canon = (value: unknown) =>
  JSON.stringify(value ?? null, (_key, entry) => {
    if (entry === "") return undefined;
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return Object.fromEntries(Object.entries(entry).sort(([a], [b]) => a.localeCompare(b)));
    }
    return entry;
  });

export const same = (a: unknown, b: unknown) => canon(a) === canon(b);

function show(value: unknown): string {
  if (value == null || value === "") return "(none)";
  if (Array.isArray(value)) return value.length ? value.map((item) => show(item)).join(" / ") : "(none)";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.url === "string") return `${record.url} labelled "${record.label ?? ""}"${record.caption ? `, caption "${record.caption}"` : ""}`;
    if (typeof record.label === "string") return [record.lead, record.label, record.detail, record.aside].filter(Boolean).join(" | ");
    if (Array.isArray(record.columns)) return `columns ${(record.columns as string[]).join(", ")}, ${record.rows} rows${record.split ? ", split" : ""}`;
    return JSON.stringify(value);
  }
  return `"${String(value)}"`;
}

/** Field-by-field changes of an edited sign, as "title "A" → "B"". */
export function describeEdit(base: Sign, edit: SignEdit): string[] {
  return EDITABLE_FIELDS.filter((field) => field in edit && !same(base[field], edit[field])).map(
    (field) => `${field}: ${show(base[field])} → ${show(edit[field])}`,
  );
}

function describeNew(sign: Sign): string {
  const layout = sign.layout ?? "statement";
  const parts = [
    layout !== "statement" && `layout "${layout}"${sign.tiles && sign.tiles > 1 ? ` with ${sign.tiles} cut-out cards per page` : ""}`,
    `title ${show(sign.title)}`,
    sign.eyebrow && `eyebrow ${show(sign.eyebrow)}`,
    sign.subtitle && `subtitle ${show(sign.subtitle)}`,
    sign.body?.length && `body ${show(sign.body)}`,
    sign.rows?.length && `rows ${show(sign.rows)}`,
    sign.icon && `icon "${sign.icon}"`,
    sign.arrow && `arrow "${sign.arrow}"`,
    sign.markers?.length && `map numbers ${sign.markers.join(", ")}`,
    sign.qr && `QR code ${show(sign.qr)}${sign.qr.ecc && sign.qr.ecc !== "M" ? ` (error correction ${sign.qr.ecc})` : ""}`,
    sign.sheet && `sheet ${show(sign.sheet)}`,
    sign.figure && `figure ${show(sign.figure)}`,
    sign.note && `note ${show(sign.note)}`,
    sign.art && `line art "${sign.art}"`,
    sign.orientation === "landscape" ? "landscape" : "portrait",
  ].filter(Boolean);
  return parts.join("; ");
}

type PromptInput = {
  library: Sign[];
  removed: string[];
  edits: Record<string, SignEdit>;
  added: Sign[];
};

export function changeCount({ library, removed, edits, added }: PromptInput) {
  const byId = new Map(library.map((sign) => [sign.id, sign]));
  const edited = Object.entries(edits).filter(([id, edit]) => byId.has(id) && !removed.includes(id) && describeEdit(byId.get(id)!, edit).length);
  return { removed: removed.filter((id) => byId.has(id)).length, edited: edited.length, added: added.length };
}

/**
 * A prompt for Claude Code that applies what was decided in the generator:
 * which signs to drop, which to reword, which to add.
 */
export function buildPrompt({ library, removed, edits, added }: PromptInput): string {
  const byId = new Map(library.map((sign) => [sign.id, sign]));
  const gone = removed.map((id) => byId.get(id)).filter((sign): sign is Sign => Boolean(sign));
  const changed = Object.entries(edits)
    .filter(([id]) => byId.has(id) && !removed.includes(id))
    .map(([id, edit]) => ({ sign: byId.get(id)!, lines: describeEdit(byId.get(id)!, edit) }))
    .filter((entry) => entry.lines.length);

  const out: string[] = [
    "Update the A4 sign generator at /signage on alpsconference.com (signs are defined in src/data/signage.ts).",
    "",
  ];

  if (!gone.length && !changed.length && !added.length) {
    out.push("No changes: keep every sign as it is.");
    return out.join("\n");
  }

  if (gone.length) {
    const handWritten = gone.filter((sign) => !sign.derived);
    const derived = gone.filter((sign) => sign.derived);
    out.push(`${gone.length === 1 ? "Remove this sign" : `Remove these ${gone.length} signs`}: we won't print ${gone.length === 1 ? "it" : "them"} for ALPS 2026.`);
    if (handWritten.length) {
      out.push("", "Delete their entries from SIGNS:");
      for (const sign of handWritten) out.push(`- \`${sign.id}\` · ${signName(sign)} (${SIGN_CATEGORY_LABEL[sign.category] ?? sign.category})`);
    }
    if (derived.length) {
      out.push("", "These are generated from the program data: add their ids to EXCLUDED_SIGN_IDS (or drop the generator if a whole group goes):");
      for (const sign of derived) out.push(`- \`${sign.id}\` · ${signName(sign)} (${SIGN_CATEGORY_LABEL[sign.category] ?? sign.category})`);
    }
    out.push("");
  }

  if (changed.length) {
    out.push(changed.length === 1 ? "Change this sign:" : `Change these ${changed.length} signs:`);
    for (const { sign, lines } of changed) {
      out.push(`- \`${sign.id}\` · ${signName(sign)}${sign.derived ? " (generated: change it in its generator or the source data)" : ""}`);
      for (const line of lines) out.push(`  - ${line}`);
    }
    out.push("");
  }

  if (added.length) {
    out.push(`Add ${added.length === 1 ? "this sign" : `these ${added.length} signs`} to SIGNS, in the category that fits best:`);
    for (const sign of added) out.push(`- ${describeNew(sign)}`);
    out.push("");
  }

  out.push(
    "Keep every other sign as it is, and keep the copy in sentence case, without emoji. Run `pnpm build` and check /signage still renders every sign on one A4 page.",
  );
  return out.join("\n");
}
