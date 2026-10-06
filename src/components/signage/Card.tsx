import { memo, type MouseEvent as ReactMouseEvent } from "react";
import { Check, CopyPlus, Pencil, RotateCcw } from "lucide-react";
import { signName, type Sign } from "../../data/signage";
import { SignSheet } from "./SignSheet";
import type { ArrowChoice } from "./state";
import { ArrowGlyph, cls, Compass, ICON_SM, Stepper } from "./ui";

type CardProps = {
  sign: Sign;
  copies: number;
  edited: boolean;
  custom: boolean;
  removed: boolean;
  editing: boolean;
  /** Arrow tool on the card: only statement signs carry an arrow. */
  arrowTool: boolean;
  compassOpen: boolean;
  lineArt: boolean;
  fontsReady: boolean;
  onToggle: (id: string, on: boolean, range: boolean) => void;
  onCopies: (id: string, copies: number) => void;
  onArrow: (id: string, choice: ArrowChoice) => void;
  onCompass: (id: string | null) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onOpen: (id: string) => void;
  onShoot: (id: string, target: HTMLElement, x: number, y: number) => void;
  onRestore: (id: string) => void;
};

export const Card = memo(function Card({
  sign,
  copies,
  edited,
  custom,
  removed,
  editing,
  arrowTool,
  compassOpen,
  lineArt,
  fontsReady,
  onToggle,
  onCopies,
  onArrow,
  onCompass,
  onEdit,
  onDuplicate,
  onOpen,
  onShoot,
  onRestore,
}: CardProps) {
  const name = signName(sign);
  const landscape = sign.orientation === "landscape";

  if (removed) {
    return (
      <article className="sg-card" data-id={sign.id}>
        <div className={cls("sg-wreck", landscape && "is-landscape")}>
          <span className="sg-wreck__scorch" aria-hidden="true" />
          <strong>Blasted</strong>
          <p>{name}</p>
          <button type="button" className="sg-btn sg-btn--small" onClick={() => onRestore(sign.id)}>
            <RotateCcw {...ICON_SM} />
            Restore
          </button>
        </div>
      </article>
    );
  }

  const handlePreview = (event: ReactMouseEvent<HTMLButtonElement>) => {
    if (event.currentTarget.closest<HTMLElement>(".sg")?.dataset.shooter === "on") {
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

  const arrow: ArrowChoice = sign.arrow ?? "none";
  const tags = [custom && "Yours", edited && "Edited", sign.derived && "Program data"].filter(Boolean) as string[];

  return (
    <article className={cls("sg-card", copies > 0 && "is-selected", editing && "is-editing")} data-id={sign.id}>
      <div className={cls("sg-card__thumb", landscape && "is-landscape")}>
        <button type="button" className="sg-card__preview" onClick={handlePreview} aria-label={`${name}: open a large preview`}>
          <SignSheet sign={sign} lineArt={lineArt} fontsReady={fontsReady} />
        </button>
        <div className="sg-card__tools">
          {arrowTool && (
            <button
              type="button"
              className="sg-tool"
              aria-expanded={compassOpen}
              onClick={() => onCompass(compassOpen ? null : sign.id)}
              title={arrow === "none" ? "Add an arrow" : "Turn or remove the arrow"}
              aria-label={`Arrow on ${name}`}
            >
              <ArrowGlyph choice={arrow} size={14} />
            </button>
          )}
          <button type="button" className="sg-tool" onClick={() => onDuplicate(sign.id)} title="Duplicate into your signs" aria-label={`Duplicate ${name}`}>
            <CopyPlus {...ICON_SM} />
          </button>
          <button type="button" className="sg-tool" onClick={() => onEdit(sign.id)} title="Edit" aria-label={`Edit ${name}`}>
            <Pencil {...ICON_SM} />
          </button>
        </div>
        {copies > 1 && (
          <span className="sg-card__badge" aria-hidden="true">
            {copies}×
          </span>
        )}
        {compassOpen && (
          <div className="sg-card__compass">
            <Compass
              value={arrow}
              autoFocus
              onChange={(choice) => {
                onArrow(sign.id, choice);
                onCompass(null);
              }}
            />
          </div>
        )}
      </div>
      <div className="sg-card__meta">
        <label className="sg-card__check" title="Print this sign. Shift-click to tick a range.">
          <input
            type="checkbox"
            checked={copies > 0}
            onChange={(event) => onToggle(sign.id, event.target.checked, (event.nativeEvent as MouseEvent).shiftKey)}
            aria-label={`Print ${name}`}
          />
          <Check size={12} strokeWidth={3.2} aria-hidden="true" />
        </label>
        <div className="sg-card__label">
          <p className="sg-card__name" title={name}>
            {name}
          </p>
          <p className="sg-card__sub">
            {tags.map((tag) => (
              <span key={tag} className={cls("sg-tag", tag !== "Program data" && "sg-tag--accent")}>
                {tag}
              </span>
            ))}
            <span className="sg-card__id">{sign.id}</span>
          </p>
        </div>
        {copies > 0 && <Stepper value={copies} onChange={(value) => onCopies(sign.id, value)} label="Copies" />}
      </div>
    </article>
  );
});
