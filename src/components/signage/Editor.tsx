import { Check, Printer, RectangleHorizontal, RectangleVertical, RotateCcw, Trash2 } from "lucide-react";
import { SIGN_ART, signName, type Sign, type SignArt, type SignLayout } from "../../data/signage";
import type { EditableField } from "./prompt";
import { QR_ECC } from "./qr";
import { SignSheet } from "./SignSheet";
import type { Draft } from "./state";
import { Compass, Field, FieldGroup, ICON, IconPicker, Panel, Segmented } from "./ui";

export const ORIENTATIONS = [
  { id: "portrait" as const, label: <RectangleVertical {...ICON} />, title: "Portrait" },
  { id: "landscape" as const, label: <RectangleHorizontal {...ICON} />, title: "Landscape" },
];

const LAYOUTS: { id: SignLayout; label: string; title: string }[] = [
  { id: "statement", label: "Sign", title: "Icon or arrow, title, text and a QR code" },
  { id: "schedule", label: "List", title: "A timed list: program, menu, steps" },
  { id: "sheet", label: "Sheet", title: "A ruled table to fill in by hand" },
  { id: "timer", label: "Figure", title: "One giant figure, like the time signals" },
];

type EditorProps = {
  /** The sign being edited as it prints now, or null for a new sign. */
  base: Sign | null;
  custom: boolean;
  fields: Set<EditableField>;
  draft: Draft;
  setDraft: (draft: Draft) => void;
  preview: Sign;
  hasEdit: boolean;
  /** Arrows are off for signs with words: say so next to the compass. */
  arrowsHidden: boolean;
  lineArt: boolean;
  fontsReady: boolean;
  onSave: () => void;
  onRevert: () => void;
  onDelete: () => void;
  onPrint: (sign: Sign) => void;
  onClose: () => void;
};

export function Editor({
  base,
  custom,
  fields,
  draft,
  setDraft,
  preview,
  hasEdit,
  arrowsHidden,
  lineArt,
  fontsReady,
  onSave,
  onRevert,
  onDelete,
  onPrint,
  onClose,
}: EditorProps) {
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft({ ...draft, [key]: value });
  const { layout } = draft;
  const words = layout !== "timer";
  const canSave = Boolean(base || draft.title.trim() || draft.arrow || draft.icon || draft.figure.trim());
  const locked = Boolean(base?.derived && !custom && (base.rows?.length || base.sheet || base.figure));

  return (
    <Panel
      kicker={base ? (custom ? "Edit your sign" : "Edit sign") : "New sign"}
      title={base ? signName(base) : draft.title.trim() || "Untitled sign"}
      onClose={onClose}
      preview={
        <div className={preview.orientation === "landscape" ? "is-landscape" : undefined}>
          <SignSheet sign={preview} lineArt={lineArt} fontsReady={fontsReady} />
        </div>
      }
      footer={
        <>
          <button type="submit" form="sg-editor" className="sg-btn sg-btn--primary" disabled={!canSave}>
            <Check {...ICON} />
            {base ? "Save" : "Add to your signs"}
          </button>
          <button type="button" className="sg-btn" onClick={() => onPrint(preview)} title="Print this version once, without saving">
            <Printer {...ICON} />
            Print
          </button>
          <span className="sg-spacer" />
          {base && !custom && hasEdit && (
            <button type="button" className="sg-btn sg-btn--ghost" onClick={onRevert} title="Back to the original wording">
              <RotateCcw {...ICON} />
              Original
            </button>
          )}
          {base && custom && (
            <button type="button" className="sg-btn sg-btn--ghost sg-btn--danger" onClick={onDelete} title="Delete this sign">
              <Trash2 {...ICON} />
              Delete
            </button>
          )}
        </>
      }
    >
      <form
        id="sg-editor"
        className="sg-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSave) onSave();
        }}
      >
        {fields.has("layout") && (
          <FieldGroup label="Layout" wide>
            <Segmented
              value={layout}
              options={LAYOUTS}
              // Line art suits signs; tables and figures read better clean.
              onChange={(value) =>
                setDraft({ ...draft, layout: value, art: value === "statement" ? draft.art || "synapse" : draft.art === "synapse" ? "" : draft.art })
              }
              label="Layout"
              wide
            />
          </FieldGroup>
        )}
        <FieldGroup label="Page">
          <Segmented value={draft.orientation} options={ORIENTATIONS} onChange={(value) => set("orientation", value)} label="Orientation" />
        </FieldGroup>
        <Field label="Line art">
          <select value={draft.art} onChange={(event) => set("art", event.target.value as SignArt | "")}>
            {(base || layout !== "statement") && <option value="">Default</option>}
            {SIGN_ART.map((art) => (
              <option key={art.id} value={art.id}>
                {art.label}
              </option>
            ))}
          </select>
        </Field>

        {layout === "timer" && fields.has("figure") && (
          <Field label="Figure" wide hint="A number or a short word: 10, Q&A, Time.">
            <input value={draft.figure} onChange={(event) => set("figure", event.target.value)} placeholder="10" />
          </Field>
        )}
        {words && (
          <Field label="Eyebrow" wide>
            <input value={draft.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} placeholder="Saturday · 16:00" />
          </Field>
        )}
        <Field label="Title" wide hint={layout === "timer" ? undefined : "Sentence case. It is sized to fit the page."}>
          <input value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder={layout === "timer" ? "minutes left" : "Group picture here"} autoFocus={!base} />
        </Field>
        {words && (
          <Field label="Subtitle" wide>
            <input value={draft.subtitle} onChange={(event) => set("subtitle", event.target.value)} />
          </Field>
        )}
        {words && layout !== "sheet" && (
          <Field label="Text" wide hint="Leave an empty line between paragraphs.">
            <textarea rows={3} value={draft.body} onChange={(event) => set("body", event.target.value)} />
          </Field>
        )}
        {(layout === "statement" || layout === "schedule") && fields.has("rows") && (
          <Field label="List" wide hint={<>One item per line. Add columns with bars: <code>12:00 | Lunch | Saal 2 | CHF 20</code></>}>
            <textarea rows={4} className="sg-mono" value={draft.rows} onChange={(event) => set("rows", event.target.value)} spellCheck={false} />
          </Field>
        )}
        {layout === "sheet" && fields.has("sheet") && (
          <>
            <Field label="Columns" wide hint="Separate them with commas.">
              <input value={draft.sheetColumns} onChange={(event) => set("sheetColumns", event.target.value)} placeholder="First name, Last name" />
            </Field>
            <Field label="Lines">
              <input type="number" min={1} max={60} value={draft.sheetRows} onChange={(event) => set("sheetRows", Number(event.target.value))} />
            </Field>
            <label className="sg-checkline">
              <input type="checkbox" checked={draft.sheetSplit} onChange={(event) => set("sheetSplit", event.target.checked)} />
              Two tables side by side
            </label>
          </>
        )}

        {(layout === "statement" || layout === "sheet") && (
          <FieldGroup label="Icon" wide>
            <IconPicker value={draft.icon} onChange={(value) => set("icon", value)} />
          </FieldGroup>
        )}
        {layout === "statement" && (
          <FieldGroup
            label="Arrow"
            hint={arrowsHidden && words ? "Arrows are switched off in the toolbar." : base && !custom ? "Applies to your print only." : "Replaces the icon."}
          >
            <Compass value={draft.arrow || "none"} onChange={(choice) => set("arrow", choice === "none" ? "" : choice)} />
          </FieldGroup>
        )}
        {words && layout !== "sheet" && (
          <Field label="Venue map numbers" hint="From /map, e.g. 8, 9">
            <input value={draft.markers} onChange={(event) => set("markers", event.target.value)} inputMode="numeric" />
          </Field>
        )}

        {(layout === "statement" || layout === "schedule") && (
          <fieldset className="sg-fieldset">
            <legend>QR code</legend>
            <Field label="Link" wide>
              <input value={draft.qrUrl} onChange={(event) => set("qrUrl", event.target.value)} placeholder="alpsconference.com/links" inputMode="url" />
            </Field>
            {draft.qrUrl.trim() && (
              <>
                <Field label="Label" wide>
                  <input value={draft.qrLabel} onChange={(event) => set("qrLabel", event.target.value)} placeholder="The link, shortened" />
                </Field>
                <Field label="Caption" wide>
                  <input value={draft.qrCaption} onChange={(event) => set("qrCaption", event.target.value)} />
                </Field>
                <FieldGroup label="Error correction" wide>
                  <Segmented value={draft.ecc} options={QR_ECC.map((level) => ({ id: level.id, label: level.label, title: level.hint }))} onChange={(value) => set("ecc", value)} label="Error correction" />
                </FieldGroup>
              </>
            )}
          </fieldset>
        )}

        <Field label="Small print" wide>
          <input value={draft.note} onChange={(event) => set("note", event.target.value)} placeholder="Shown above the footer" />
        </Field>

        {locked && (
          <p className="sg-note">
            The lists on this sign come from the program data, so they are not editable here. Change the words around them, or ask for
            the data change in the prompt.
          </p>
        )}
      </form>
    </Panel>
  );
}
