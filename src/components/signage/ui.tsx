import { useEffect, useState, type ReactNode } from "react";
import { ArrowUp, Ban, ChevronDown, X } from "lucide-react";
import { SIGN_ICONS, type SignIcon } from "../../data/signage";
import { ARROW_ANGLE, ICONS } from "./SignSheet";
import { ARROW_LABEL, type ArrowChoice } from "./state";

export const ICON = { size: 16, strokeWidth: 1.75, "aria-hidden": true } as const;
export const ICON_SM = { size: 14, strokeWidth: 1.75, "aria-hidden": true } as const;

export const cls = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");

export function ArrowGlyph({ choice, size = 16 }: { choice: ArrowChoice; size?: number }) {
  if (choice === "none") return <Ban size={size} strokeWidth={1.75} aria-hidden="true" />;
  return <ArrowUp size={size} strokeWidth={2} aria-hidden="true" style={{ rotate: `${ARROW_ANGLE[choice]}deg` }} />;
}

const COMPASS: ArrowChoice[] = ["up-left", "up", "up-right", "left", "none", "right", "down-left", "down", "down-right"];

/** Eight directions around "no arrow": where the sign hangs decides. */
export function Compass({ value, onChange, autoFocus }: { value: ArrowChoice; onChange: (choice: ArrowChoice) => void; autoFocus?: boolean }) {
  return (
    <div className="sg-compass" role="radiogroup" aria-label="Arrow direction">
      {COMPASS.map((choice) => {
        const label = choice === "none" ? "No arrow" : ARROW_LABEL[choice];
        return (
          <button
            key={choice}
            type="button"
            role="radio"
            aria-checked={value === choice}
            aria-label={label}
            title={label}
            className={choice === "none" ? "is-none" : undefined}
            autoFocus={autoFocus && value === choice}
            onClick={() => onChange(choice)}
          >
            <ArrowGlyph choice={choice} size={choice === "none" ? 15 : 17} />
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
  wide,
}: {
  value: T;
  options: { id: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
  label: string;
  wide?: boolean;
}) {
  return (
    <div className={cls("sg-seg", wide && "sg-seg--wide")} role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <button
          key={String(option.id)}
          type="button"
          role="radio"
          aria-checked={value === option.id}
          title={option.title}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function Field({ label, hint, wide, children }: { label: string; hint?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <label className={cls("sg-field", wide && "sg-field--wide")}>
      <span className="sg-field__label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

/** A field whose control is not a single input: a group instead of a label. */
export function FieldGroup({ label, hint, wide, children }: { label: string; hint?: ReactNode; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cls("sg-field", wide && "sg-field--wide")} role="group" aria-label={label}>
      <span className="sg-field__label">{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </div>
  );
}

/** The current icon, opening onto every icon a sign can carry. */
export function IconPicker({ value, onChange }: { value: SignIcon | ""; onChange: (icon: SignIcon | "") => void }) {
  const [open, setOpen] = useState(false);
  const Current = value ? ICONS[value] : null;
  const current = SIGN_ICONS.find((icon) => icon.id === value);
  return (
    <div className="sg-iconpick">
      <button type="button" className="sg-iconpick__current" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span className="sg-iconpick__glyph">{Current ? <Current {...ICON} /> : <Ban {...ICON_SM} />}</span>
        <span>{current?.label ?? "No icon"}</span>
        <ChevronDown {...ICON_SM} className="sg-iconpick__chevron" />
      </button>
      {open && (
        <div className="sg-iconpick__grid" role="radiogroup" aria-label="Icon">
          <button type="button" role="radio" aria-checked={!value} title="No icon" aria-label="No icon" onClick={() => { onChange(""); setOpen(false); }}>
            <Ban {...ICON_SM} />
          </button>
          {SIGN_ICONS.map((icon) => {
            const Glyph = ICONS[icon.id];
            return (
              <button
                key={icon.id}
                type="button"
                role="radio"
                aria-checked={value === icon.id}
                title={icon.label}
                aria-label={icon.label}
                onClick={() => {
                  onChange(icon.id);
                  setOpen(false);
                }}
              >
                <Glyph {...ICON} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 20, label }: { value: number; onChange: (value: number) => void; min?: number; max?: number; label: string }) {
  return (
    <span className="sg-stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} aria-label="One fewer" disabled={value <= min}>
        −
      </button>
      <output>{value}</output>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="One more" disabled={value >= max}>
        +
      </button>
    </span>
  );
}

/** The right-hand inspector: a live preview over a form, actions pinned to the bottom. */
export function Panel({
  kicker,
  title,
  onClose,
  preview,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  onClose: () => void;
  preview: ReactNode;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <aside className="sg-inspector" aria-label={`${kicker}: ${title}`}>
      <header className="sg-inspector__head">
        <div>
          <p className="sg-kicker">{kicker}</p>
          <h2 title={title}>{title}</h2>
        </div>
        <button type="button" className="sg-icon-btn" onClick={onClose} aria-label="Close the panel" title="Close (Esc)">
          <X {...ICON} />
        </button>
      </header>
      <div className="sg-inspector__body">
        <div className="sg-inspector__preview">{preview}</div>
        {children}
      </div>
      <footer className="sg-inspector__foot">{footer}</footer>
    </aside>
  );
}

/** Platform-aware modifier label for shortcuts. */
export function useModKey() {
  const [mod, setMod] = useState("Ctrl");
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setMod("⌘");
  }, []);
  return mod;
}
