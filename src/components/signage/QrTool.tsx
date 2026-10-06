import { useMemo } from "react";
import { Check, Download, Printer, RotateCcw, Trash2, Wifi } from "lucide-react";
import { SIGN_TILES, signName, type Sign, type SignOrientation, type SignTiles } from "../../data/signage";
import { WIFI } from "../../data/links";
import { ORIENTATIONS } from "./Editor";
import type { SignEdit } from "./prompt";
import { downloadQrPng, downloadQrSvg, isLink, normaliseUrl, parseWifi, QR_ECC, qrMatrix, shortUrl, wifiPayload, type QrEcc, type WifiSecurity } from "./qr";
import { SignSheet } from "./SignSheet";
import { Field, FieldGroup, ICON, ICON_SM, Panel, Segmented } from "./ui";

export type QrKind = "link" | "wifi" | "text";

export type QrDraft = {
  kind: QrKind;
  url: string;
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden: boolean;
  text: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  /** Empty: written from the content. */
  label: string;
  caption: string;
  ecc: QrEcc;
  tiles: SignTiles;
  orientation: SignOrientation;
};

export const BLANK_QR: QrDraft = {
  kind: "link",
  url: "",
  ssid: "",
  password: "",
  security: "WPA",
  hidden: false,
  text: "",
  eyebrow: "",
  title: "",
  subtitle: "",
  label: "",
  caption: "",
  ecc: "M",
  tiles: 1,
  orientation: "portrait",
};

// The venue network is open and asks for a login in the browser once joined.
const VENUE_WIFI: Partial<QrDraft> = {
  ssid: WIFI.network,
  password: "",
  security: "nopass",
  hidden: false,
  title: "Wifi",
  caption: `Then log in with username ${WIFI.username} and password ${WIFI.password}.`,
};

export function qrPayload(draft: QrDraft) {
  if (draft.kind === "link") return normaliseUrl(draft.url);
  if (draft.kind === "wifi") return draft.ssid.trim() ? wifiPayload({ ...draft, ssid: draft.ssid.trim() }) : "";
  return draft.text.trim();
}

/** The label and caption written from the content when you leave them empty. */
function autoText(draft: QrDraft): { label: string; caption: string } {
  if (draft.kind === "link") return { label: shortUrl(normaliseUrl(draft.url)), caption: "" };
  if (draft.kind === "wifi") {
    return {
      label: draft.ssid.trim() ? `Network: ${draft.ssid.trim()}` : "",
      caption: draft.security !== "nopass" && draft.password ? `Password: ${draft.password}` : "",
    };
  }
  return { label: "", caption: "" };
}

export function qrDraftToEdit(draft: QrDraft): SignEdit {
  const payload = qrPayload(draft);
  const auto = autoText(draft);
  return {
    layout: "qr",
    orientation: draft.orientation === "landscape" ? "landscape" : null,
    tiles: draft.tiles > 1 ? draft.tiles : null,
    eyebrow: draft.eyebrow.trim() || null,
    title: draft.title.trim(),
    subtitle: draft.subtitle.trim() || null,
    qr: payload
      ? {
          url: payload,
          label: draft.label.trim() || auto.label,
          caption: draft.caption.trim() || auto.caption,
          ...(draft.ecc !== "M" ? { ecc: draft.ecc } : {}),
        }
      : null,
  };
}

export function signToQrDraft(sign: Sign): QrDraft {
  const url = sign.qr?.url ?? "";
  const wifi = parseWifi(url);
  const kind: QrKind = wifi ? "wifi" : !url || isLink(url) ? "link" : "text";
  const draft: QrDraft = {
    ...BLANK_QR,
    ...(wifi ?? {}),
    kind,
    url: kind === "link" ? url : "",
    text: kind === "text" ? url : "",
    eyebrow: sign.eyebrow ?? "",
    title: sign.title,
    subtitle: sign.subtitle ?? "",
    ecc: sign.qr?.ecc ?? "M",
    tiles: sign.tiles ?? 1,
    orientation: sign.orientation ?? "portrait",
  };
  const auto = autoText(draft);
  draft.label = sign.qr?.label && sign.qr.label !== auto.label ? sign.qr.label : "";
  draft.caption = sign.qr?.caption && sign.qr.caption !== auto.caption ? sign.qr.caption : "";
  return draft;
}

type QrToolProps = {
  base: Sign | null;
  custom: boolean;
  draft: QrDraft;
  setDraft: (draft: QrDraft) => void;
  preview: Sign;
  presets: { url: string; label: string }[];
  hasEdit: boolean;
  fontsReady: boolean;
  onSave: () => void;
  onRevert: () => void;
  onDelete: () => void;
  onPrint: (sign: Sign) => void;
  onClose: () => void;
};

export function QrTool({ base, custom, draft, setDraft, preview, presets, hasEdit, fontsReady, onSave, onRevert, onDelete, onPrint, onClose }: QrToolProps) {
  const set = <K extends keyof QrDraft>(key: K, value: QrDraft[K]) => setDraft({ ...draft, [key]: value });
  const payload = qrPayload(draft);
  const auto = autoText(draft);
  const code = useMemo(() => (payload ? qrMatrix(payload, draft.ecc) : null), [payload, draft.ecc]);
  const presetValue = presets.some((preset) => preset.url === payload) ? payload : "";

  return (
    <Panel
      kicker={base ? "Edit QR code" : "QR code generator"}
      title={base ? signName(base) : draft.title.trim() || "New QR code"}
      onClose={onClose}
      preview={
        <div className={preview.orientation === "landscape" ? "is-landscape" : undefined}>
          <SignSheet sign={preview} fontsReady={fontsReady} />
        </div>
      }
      footer={
        <>
          <button type="submit" form="sg-qr" className="sg-btn sg-btn--primary" disabled={!payload}>
            <Check {...ICON} />
            {base ? "Save" : "Add to your signs"}
          </button>
          <button type="button" className="sg-btn" onClick={() => onPrint(preview)} disabled={!payload} title="Print this sheet once, without saving">
            <Printer {...ICON} />
            Print
          </button>
          <span className="sg-spacer" />
          {base && !custom && hasEdit && (
            <button type="button" className="sg-icon-btn" onClick={onRevert} title="Back to the original" aria-label="Back to the original">
              <RotateCcw {...ICON} />
            </button>
          )}
          {base && custom && (
            <button type="button" className="sg-icon-btn sg-icon-btn--danger" onClick={onDelete} title="Delete this sign" aria-label="Delete this sign">
              <Trash2 {...ICON} />
            </button>
          )}
        </>
      }
    >
      <form
        id="sg-qr"
        className="sg-form"
        onSubmit={(event) => {
          event.preventDefault();
          if (payload) onSave();
        }}
      >
        <FieldGroup label="The code opens" wide>
          <Segmented
            value={draft.kind}
            options={[
              { id: "link", label: "Link" },
              { id: "wifi", label: "Wi-Fi" },
              { id: "text", label: "Text" },
            ]}
            onChange={(kind) => setDraft({ ...draft, kind, ...(kind === "wifi" && !draft.ssid ? VENUE_WIFI : {}) })}
            label="Content"
            wide
          />
        </FieldGroup>

        {draft.kind === "link" && (
          <>
            <Field label="Link" wide>
              <input value={draft.url} onChange={(event) => set("url", event.target.value)} placeholder="alpsconference.com/links" inputMode="url" autoFocus={!base} />
            </Field>
            {presets.length > 0 && (
              <Field label="Or a link from the signs" wide>
                <select value={presetValue} onChange={(event) => event.target.value && set("url", event.target.value)}>
                  <option value="">Choose…</option>
                  {presets.map((preset) => (
                    <option key={preset.url} value={preset.url}>
                      {preset.label} · {shortUrl(preset.url)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </>
        )}

        {draft.kind === "wifi" && (
          <>
            <button type="button" className="sg-linkbtn sg-field--wide" onClick={() => setDraft({ ...draft, ...VENUE_WIFI })}>
              <Wifi {...ICON_SM} />
              Fill in the venue wifi ({WIFI.network})
            </button>
            <Field label="Network" wide>
              <input value={draft.ssid} onChange={(event) => set("ssid", event.target.value)} placeholder="Network name" autoComplete="off" />
            </Field>
            <FieldGroup label="Security" wide>
              <Segmented
                value={draft.security}
                options={[
                  { id: "WPA", label: "WPA/WPA2" },
                  { id: "WEP", label: "WEP" },
                  { id: "nopass", label: "Open" },
                ]}
                onChange={(value) => set("security", value)}
                label="Security"
                wide
              />
            </FieldGroup>
            {draft.security !== "nopass" && (
              <Field label="Password" wide>
                <input value={draft.password} onChange={(event) => set("password", event.target.value)} autoComplete="off" spellCheck={false} />
              </Field>
            )}
            <label className="sg-checkline">
              <input type="checkbox" checked={draft.hidden} onChange={(event) => set("hidden", event.target.checked)} />
              Hidden network
            </label>
          </>
        )}

        {draft.kind === "text" && (
          <Field label="Text" wide hint="Phones show it as plain text, or offer to call, email or open it.">
            <textarea rows={3} value={draft.text} onChange={(event) => set("text", event.target.value)} autoFocus={!base} />
          </Field>
        )}

        <FieldGroup
          label="Error correction"
          hint={
            code
              ? `${code.size} × ${code.size} modules${code.version >= 10 ? ". Dense: a shorter link scans from further away." : "."}`
              : "Add a link, network or text to make the code."
          }
        >
          <Segmented value={draft.ecc} options={QR_ECC.map((level) => ({ id: level.id, label: level.label, title: level.hint }))} onChange={(value) => set("ecc", value)} label="Error correction" />
        </FieldGroup>
        <FieldGroup label="Just the code" hint="For Canva, slides or the print shop.">
          <div className="sg-btnrow">
            <button type="button" className="sg-btn sg-btn--small" onClick={() => downloadQrSvg(payload, draft.ecc)} disabled={!payload} title="Download the code as SVG">
              <Download {...ICON_SM} />
              SVG
            </button>
            <button type="button" className="sg-btn sg-btn--small" onClick={() => downloadQrPng(payload, draft.ecc)} disabled={!payload} title="Download the code as a 2000 px PNG">
              <Download {...ICON_SM} />
              PNG
            </button>
          </div>
        </FieldGroup>

        <fieldset className="sg-fieldset">
          <legend>On the sign</legend>
          <Field label="Eyebrow" wide>
            <input value={draft.eyebrow} onChange={(event) => set("eyebrow", event.target.value)} />
          </Field>
          <Field label="Title" wide>
            <input value={draft.title} onChange={(event) => set("title", event.target.value)} placeholder="Everything on your phone" />
          </Field>
          <Field label="Subtitle" wide>
            <input value={draft.subtitle} onChange={(event) => set("subtitle", event.target.value)} />
          </Field>
          <Field label="Label under the code" wide>
            <input value={draft.label} onChange={(event) => set("label", event.target.value)} placeholder={auto.label || "None"} />
          </Field>
          {draft.tiles <= 4 && (
            <Field label="Caption" wide>
              <input value={draft.caption} onChange={(event) => set("caption", event.target.value)} placeholder={auto.caption || "None"} />
            </Field>
          )}
        </fieldset>

        <FieldGroup label="Per sheet" hint={SIGN_TILES.find((tile) => tile.id === draft.tiles)?.hint}>
          <Segmented value={draft.tiles} options={SIGN_TILES.map((tile) => ({ id: tile.id, label: tile.label, title: tile.hint }))} onChange={(value) => set("tiles", value)} label="Cards per sheet" />
        </FieldGroup>
        <FieldGroup label="Page">
          <Segmented value={draft.orientation} options={ORIENTATIONS} onChange={(value) => set("orientation", value)} label="Orientation" />
        </FieldGroup>
      </form>
    </Panel>
  );
}
