import { encode } from "uqr";

export type QrEcc = "L" | "M" | "Q" | "H";
export const QR_ECC: { id: QrEcc; label: string; hint: string }[] = [
  { id: "L", label: "L", hint: "7% can be damaged. Smallest code." },
  { id: "M", label: "M", hint: "15% can be damaged. The default." },
  { id: "Q", label: "Q", hint: "25% can be damaged." },
  { id: "H", label: "H", hint: "30% can be damaged. Densest code." },
];

/** Modules of a QR code, without a quiet zone. */
export function qrMatrix(text: string, ecc: QrEcc = "M") {
  const { data, size, version } = encode(text || " ", { ecc, border: 0 });
  return { data, size, version };
}

/** One path for the whole code: each run of dark modules in a row becomes a rectangle. */
export function qrPath(text: string, ecc: QrEcc = "M") {
  const { data, size, version } = qrMatrix(text, ecc);
  let d = "";
  data.forEach((row, y) => {
    let x = 0;
    while (x < size) {
      if (!row[x]) {
        x += 1;
        continue;
      }
      const start = x;
      while (x < size && row[x]) x += 1;
      d += `M${start} ${y}h${x - start}v1h${start - x}z`;
    }
  });
  return { d, size, version };
}

/* ------------------------------------------------------------- payloads -- */

export type WifiSecurity = "WPA" | "WEP" | "nopass";

// Wi-Fi payloads escape \ ; , : and " with a backslash.
const wifiEscape = (value: string) => value.replace(/([\\;,:"])/g, "\\$1");
const wifiUnescape = (value: string) => value.replace(/\\(.)/g, "$1");

/** The string phones read as "join this network". */
export function wifiPayload({ ssid, password, security, hidden }: { ssid: string; password: string; security: WifiSecurity; hidden?: boolean }) {
  const parts = [`T:${security}`, `S:${wifiEscape(ssid)}`];
  if (security !== "nopass") parts.push(`P:${wifiEscape(password)}`);
  if (hidden) parts.push("H:true");
  return `WIFI:${parts.join(";")};;`;
}

export function parseWifi(payload: string): { ssid: string; password: string; security: WifiSecurity; hidden: boolean } | null {
  if (!payload.startsWith("WIFI:")) return null;
  const fields: Record<string, string> = {};
  for (const match of payload.slice(5).matchAll(/([TSPH]):((?:\\.|[^;])*);/g)) fields[match[1]] = wifiUnescape(match[2]);
  const security = fields.T === "WEP" || fields.T === "nopass" ? fields.T : "WPA";
  return { ssid: fields.S ?? "", password: fields.P ?? "", security, hidden: fields.H === "true" };
}

export const isLink = (text: string) => /^https?:\/\//i.test(text);
export const shortUrl = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, "").replace(/\/$/, "");

/** Adds https:// to what looks like a bare address ("alps.foundation/support"). */
export function normaliseUrl(value: string) {
  const url = value.trim();
  if (!url || isLink(url)) return url;
  return /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(url) ? `https://${url}` : url;
}

/* ------------------------------------------------------------ downloads -- */

const QUIET = 4;

function fileName(text: string, extension: string) {
  const slug = shortUrl(text)
    .replace(/^WIFI:.*?S:((?:\\.|[^;])*).*/, "wifi-$1")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `qr-${slug || "code"}.${extension}`;
}

export function saveFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** A standalone SVG with the standard four-module quiet zone, for Canva, slides or the print shop. */
export function qrSvg(text: string, ecc: QrEcc) {
  const { d, size } = qrPath(text, ecc);
  const box = size + QUIET * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-QUIET} ${-QUIET} ${box} ${box}" width="${box * 10}" height="${box * 10}" shape-rendering="crispEdges"><rect x="${-QUIET}" y="${-QUIET}" width="${box}" height="${box}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

export function downloadQrSvg(text: string, ecc: QrEcc) {
  saveFile(new Blob([qrSvg(text, ecc)], { type: "image/svg+xml" }), fileName(text, "svg"));
}

/** A PNG about 2000 px wide, sharp at any print size up to A4. */
export function downloadQrPng(text: string, ecc: QrEcc) {
  const { data, size } = qrMatrix(text, ecc);
  const box = size + QUIET * 2;
  const scale = Math.max(8, Math.round(2000 / box));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = box * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000";
  data.forEach((row, y) => row.forEach((dark, x) => dark && ctx.fillRect((x + QUIET) * scale, (y + QUIET) * scale, scale, scale)));
  canvas.toBlob((blob) => blob && saveFile(blob, fileName(text, "png")), "image/png");
}
