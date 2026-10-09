import { useEffect, useRef, useState } from "react";
import { Check, Link2 } from "lucide-react";

/** `?day=fri` slugs, shared by the schedule rows and the setup tasks. */
export const DAY_SLUGS: Record<string, string> = {
  "2026-10-08": "thu",
  "2026-10-09": "fri",
  "2026-10-10": "sat",
  "2026-10-11": "sun",
};

/** A link to this page that opens one day and points at one thing on it, e.g. `?day=fri&slot=14:00`. */
export function pageLink(dateTime: string, params: Record<string, string>) {
  const url = new URL(window.location.pathname, window.location.origin);
  url.searchParams.set("day", DAY_SLUGS[dateTime] ?? dateTime);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
}

/** Clipboard API first; the textarea fallback covers older phones and non-secure previews. */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Which key's link was just copied (shown as "Copied" for two seconds), and the copier that sets it. */
export function useCopyLink() {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (key: string, url: string) => {
    const ok = await copyText(url);
    if (!ok) {
      window.prompt("Copy this link", url);
      return;
    }
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 2000);
  };
  return { copied, copy };
}

/** The small "Link" pill: copies a link to one row or item, to paste into WhatsApp or Slack. */
export default function LinkButton({ copied, label, onCopy }: { copied: boolean; label: string; onCopy: () => void }) {
  return (
    <button
      type="button"
      className="vol-linkbtn"
      data-copied={copied || undefined}
      title={copied ? "Link copied" : `Copy a link to ${label}, to paste into WhatsApp or Slack`}
      aria-label={copied ? "Link copied" : `Copy a link to ${label}`}
      onClick={onCopy}
    >
      {copied ? <Check size={14} aria-hidden="true" /> : <Link2 size={14} aria-hidden="true" />}
      <span>{copied ? "Copied" : "Link"}</span>
    </button>
  );
}
