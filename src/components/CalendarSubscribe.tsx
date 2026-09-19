import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, CalendarPlus, Check, ChevronDown, Copy, Download } from "lucide-react";
import { CALENDAR_FILES, type CalendarFeed } from "../lib/ical";
import { withBase } from "../lib/withBase";

// Subscriptions have to point at the canonical site: a preview URL would expire under people's feet.
const SITE = import.meta.env.SITE ?? "https://alpsconference.com";

export default function CalendarSubscribe({ feed, label }: { feed: CalendarFeed; label: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const file = CALENDAR_FILES[feed];
  const path = withBase(file);
  const feedUrl = new URL(path, SITE).href;
  const webcalUrl = feedUrl.replace(/^https?:/, "webcal:");
  // Google's `cid` only accepts a webcal URL; an https one is rejected outright with
  // "Unable to add the calendar". Its first sync can take hours, hence the copy option below.
  const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}`;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2400);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyFeedUrl = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
      return;
    } catch {
      // Clipboard API refused (insecure context, no transient activation, denied permission).
    }
    // Last resort: show the link in the menu so it can be selected and copied by hand.
    setRevealed(true);
  };

  return (
    <div ref={wrapRef} className="calendar-subscribe">
      <button
        type="button"
        className="calendar-subscribe__trigger"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <CalendarPlus size={17} aria-hidden="true" />
        {label}
        <ChevronDown size={15} aria-hidden="true" className={open ? "calendar-subscribe__chevron is-open" : "calendar-subscribe__chevron"} />
      </button>
      {open && (
        <div className="calendar-subscribe__menu" role="menu">
          <a role="menuitem" href={googleUrl} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            Google Calendar
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a role="menuitem" href={webcalUrl} onClick={() => setOpen(false)}>
            Apple Calendar or Outlook
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <button role="menuitem" type="button" onClick={copyFeedUrl}>
            {copied ? "Link copied" : "Copy the calendar link"}
            {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
          </button>
          {revealed && <code className="calendar-subscribe__url">{feedUrl}</code>}
          <a role="menuitem" href={path} download={file} onClick={() => setOpen(false)}>
            Download the .ics file
            <Download size={14} aria-hidden="true" />
          </a>
          <p className="calendar-subscribe__note">
            Subscribing keeps the schedule in sync as the program changes; Google Calendar can take a
            few hours for its first sync. A downloaded file stays as it is today.
          </p>
        </div>
      )}
    </div>
  );
}
