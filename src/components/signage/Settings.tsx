import { useRef, type ReactNode } from "react";
import { Download, RotateCcw, Upload } from "lucide-react";
import { ICON_SM } from "./ui";

export type ResetKind = "selection" | "edits" | "added" | "arrows" | "removed" | "view";

type SettingsProps = {
  counts: Record<ResetKind, number>;
  pages: number;
  turnLandscape: boolean;
  /** False where the browser cannot mix portrait and landscape pages in one job: signs are always turned. */
  namedPages: boolean;
  onTurn: (on: boolean) => void;
  onReset: (kind: ResetKind) => void;
  onResetAll: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

function Row({ label, value, action, disabled, onClick }: { label: string; value: ReactNode; action: string; disabled: boolean; onClick: () => void }) {
  return (
    <li>
      <span className="sg-settings__label">{label}</span>
      <span className="sg-settings__value">{value}</span>
      <button type="button" className="sg-btn sg-btn--tiny" disabled={disabled} onClick={onClick}>
        {action}
      </button>
    </li>
  );
}

/** What this browser keeps, with a reset for each part, a backup file and the print setting. */
export function Settings({ counts, pages, turnLandscape, namedPages, onTurn, onReset, onResetAll, onExport, onImport }: SettingsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const n = (count: number, one: string, many: string) => (count ? `${count} ${count === 1 ? one : many}` : "None");

  return (
    <>
      <p className="sg-kicker">Settings</p>
      <h2>Saved in this browser</h2>
      <p>Ticks, edits, your own signs and the view stay here after a reload, until you reset them. Each reset can be undone.</p>
      <ul className="sg-settings__rows">
        <Row
          label="Ticked to print"
          value={counts.selection ? `${n(counts.selection, "sign", "signs")} · ${n(pages, "page", "pages")}` : "None"}
          action="Untick"
          disabled={!counts.selection}
          onClick={() => onReset("selection")}
        />
        <Row label="Edited signs" value={n(counts.edits, "sign", "signs")} action="Undo edits" disabled={!counts.edits} onClick={() => onReset("edits")} />
        <Row label="Your signs" value={n(counts.added, "sign", "signs")} action="Delete" disabled={!counts.added} onClick={() => onReset("added")} />
        <Row label="Arrow choices" value={n(counts.arrows, "sign", "signs")} action="Reset" disabled={!counts.arrows} onClick={() => onReset("arrows")} />
        <Row label="Blasted" value={n(counts.removed, "sign", "signs")} action="Bring back" disabled={!counts.removed} onClick={() => onReset("removed")} />
        <Row label="View" value={counts.view ? "Customised" : "Default"} action="Reset" disabled={!counts.view} onClick={() => onReset("view")} />
      </ul>

      <h3>Printing</h3>
      <label className="sg-checkline sg-settings__check">
        <input type="checkbox" checked={turnLandscape || !namedPages} disabled={!namedPages} onChange={(event) => onTurn(event.target.checked)} />
        <span>
          Turn landscape signs onto portrait sheets
          <small>
            {namedPages
              ? "One orientation for the whole job: choose Portrait in the print dialog."
              : "Always on in this browser, which cannot mix orientations in one job."}
          </small>
        </span>
      </label>

      <h3>Backup</h3>
      <p>Move your work to another computer, or send it to whoever prints.</p>
      <div className="sg-btnrow">
        <button type="button" className="sg-btn sg-btn--small" onClick={onExport}>
          <Download {...ICON_SM} />
          Download JSON
        </button>
        <button type="button" className="sg-btn sg-btn--small" onClick={() => fileRef.current?.click()}>
          <Upload {...ICON_SM} />
          Import JSON…
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) onImport(file);
          }}
        />
      </div>

      <div className="sg-settings__foot">
        <button type="button" className="sg-btn sg-btn--small sg-btn--ghost sg-btn--danger" onClick={onResetAll}>
          <RotateCcw {...ICON_SM} />
          Reset everything
        </button>
      </div>
    </>
  );
}
