import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

const CONFERENCE_DATE_UTC = Date.UTC(2026, 9, 9);
const ONE_DAY = 86_400_000;

type Countdown = {
  prefix: string;
  label: string;
  accessibleLabel: string;
};

function getZurichDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Zurich",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date());

  return Object.fromEntries(parts.map(({ type, value }) => [type, Number(value)]));
}

export function getConferenceCountdown(): Countdown | null {
  const { year, month, day } = getZurichDateParts();
  const todayUtc = Date.UTC(year, month - 1, day);
  const daysLeft = Math.round((CONFERENCE_DATE_UTC - todayUtc) / ONE_DAY);

  if (daysLeft <= 0) return null;

  if (daysLeft === 1) {
    return {
      prefix: "Conference begins",
      label: "Tomorrow",
      accessibleLabel: "The ALPS Conference begins tomorrow",
    };
  }

  const weeks = Math.floor(daysLeft / 7);
  const days = daysLeft % 7;
  const parts = [
    weeks > 0 ? `${weeks} ${weeks === 1 ? "week" : "weeks"}` : "",
    days > 0 ? `${days} ${days === 1 ? "day" : "days"}` : "",
  ].filter(Boolean);

  return {
    prefix: "Conference begins in",
    label: parts.join(" · "),
    accessibleLabel: `${parts.join(" and ")} until the ALPS Conference`,
  };
}

export default function ConferenceCountdown() {
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  useEffect(() => {
    const update = () => setCountdown(getConferenceCountdown());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  if (!countdown) return null;

  return (
    <div className="countdown-banner" role="status" aria-label={countdown.accessibleLabel}>
      <CalendarDays className="h-4 w-4" aria-hidden />
      <span className="countdown-banner__eyebrow">{countdown.prefix}</span>
      <strong>{countdown.label}</strong>
    </div>
  );
}
