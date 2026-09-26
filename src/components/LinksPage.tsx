import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronDown,
  Clock,
  Copy,
  History,
  MapPin,
  MessageCircle,
  MessageSquareHeart,
  PartyPopper,
  Utensils,
  Users,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  CONFERENCE_START,
  EXPERIENCE_SESSIONS,
  getActiveExperiences,
  getConferenceState,
  parseTimeTravel,
  type ExperienceSession,
  type TimelineEntry,
} from "../data/conferenceTimeline";
import { EXPERIENCE_PORTRAITS } from "../data/experiences";
import { QUICK_LINKS, VENUE_MAP_IMAGE, WIFI, type QuickLinkAction, type QuickLinkIcon } from "../data/links";
import type { SignupAvailability, SignupResult } from "../lib/experienceSignups";
import { withBase } from "../lib/withBase";

const ICONS: Record<QuickLinkIcon, LucideIcon> = {
  whatsapp: MessageCircle,
  map: MapPin,
  schedule: CalendarDays,
  calendar: CalendarPlus,
  afterparty: PartyPopper,
  dinner: Utensils,
  feedback: MessageSquareHeart,
  booklet: BookOpen,
  wifi: Wifi,
};

const API = withBase("api/experience-signups");
const STORAGE_KEY = "alps-links-signups";

type StoredSignup = SignupResult & { cancelToken: string; firstName: string; lastName: string };

/* ---------- Clock (supports ?time=yyyy-mm-dd-hh-mm) ---------- */

function useConferenceClock() {
  const [state, setState] = useState<{ now: Date; travelling: boolean } | null>(null);

  useEffect(() => {
    const travel = parseTimeTravel(new URLSearchParams(window.location.search).get("time"));
    const offset = travel ? travel.getTime() - Date.now() : 0;
    const tick = () => setState({ now: new Date(Date.now() + offset), travelling: Boolean(travel) });
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return state;
}

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zurich",
  hour: "2-digit",
  minute: "2-digit",
});
const dayFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Zurich",
  weekday: "short",
  day: "numeric",
  month: "short",
});

function formatRange(entry: { start: Date; end: Date }) {
  return `${timeFormat.format(entry.start)}–${timeFormat.format(entry.end)}`;
}

function splitDuration(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

function formatMinutes(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

/* ---------- Local signup memory ---------- */

function readStored(): Record<string, StoredSignup> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function writeStored(value: Record<string, StoredSignup>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Private mode: the signup still counts, it just won't be remembered on this device.
  }
}

/* ---------- Components ---------- */

function Countdown({ target, now, label }: { target: Date; now: Date; label: string }) {
  const { days, hours, minutes, seconds } = splitDuration(target.getTime() - now.getTime());
  const units = [
    { value: days, label: "days" },
    { value: hours, label: "hours" },
    { value: minutes, label: "min" },
    { value: seconds, label: "sec" },
  ];
  return (
    <div className="links-card text-center">
      <p className="links-eyebrow">{label}</p>
      <div className="mt-3 grid grid-cols-4 gap-2" role="timer" aria-live="off">
        {units.map((unit) => (
          <div key={unit.label} className="rounded-xl bg-white/[0.06] py-3">
            <div className="text-3xl font-semibold tabular-nums text-white">
              {String(unit.value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-white/55">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EntryCard({
  eyebrow,
  entry,
  now,
  live,
  extras,
}: {
  eyebrow: string;
  entry: TimelineEntry;
  now: Date;
  live?: boolean;
  extras?: ExperienceSession[];
}) {
  const total = entry.end.getTime() - entry.start.getTime();
  const progress = live ? Math.min(1, (now.getTime() - entry.start.getTime()) / total) : 0;
  const isTalk = entry.kind === "session" && entry.detail && entry.detail !== "ALPS team";

  return (
    <div className={`links-card ${live ? "links-card--live" : ""}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="links-eyebrow flex items-center gap-2">
          {live && <span className="links-live-dot" aria-hidden />}
          {eyebrow}
        </p>
        <p className="text-sm tabular-nums text-white/60">
          {live
            ? `Ends in ${formatMinutes(entry.end.getTime() - now.getTime())}`
            : `${entry.day !== dayFormat.format(now).replace(",", "") ? `${entry.day} · ` : ""}${formatRange(entry)}`}
        </p>
      </div>
      <h2 className="mt-2 text-xl font-semibold leading-snug text-white">
        {isTalk ? entry.detail : entry.title}
      </h2>
      {isTalk && <p className="mt-1 text-sm text-white/70">{entry.title}</p>}
      {!isTalk && entry.detail && <p className="mt-1 text-sm text-white/70">{entry.detail}</p>}
      {entry.menuNote && <p className="mt-2 text-sm text-white/55">{entry.menuNote}</p>}
      {live && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div className="h-full rounded-full bg-support-light" style={{ width: `${progress * 100}%` }} />
        </div>
      )}
      {extras && extras.length > 0 && (
        <ul className="mt-4 space-y-1.5 border-t border-white/10 pt-3 text-sm text-white/75">
          {extras.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="text-white/45">Also on</span>
              <span>
                {s.title}
                {s.venue ? ` · ${s.venue}` : ""}
                <span className="text-white/45"> until {s.end ? timeFormat.format(s.end) : ""}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function StatusSection({ now, travelling }: { now: Date; travelling: boolean }) {
  const state = getConferenceState(now);
  const active = getActiveExperiences(now);

  return (
    <section aria-label="Conference status" className="space-y-3">
      {travelling && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm text-white/85">
          <span className="flex items-center gap-2">
            <History className="h-4 w-4 text-accent-light" aria-hidden />
            Viewing as {dayFormat.format(now)}, {timeFormat.format(now)}
          </span>
          <a href={withBase("links")} className="font-medium text-white underline underline-offset-4">
            Back to now
          </a>
        </div>
      )}

      {state.phase === "before" && (
        <Countdown target={CONFERENCE_START} now={now} label="Doors open in" />
      )}

      {state.phase === "live" && (
        <>
          <EntryCard eyebrow="Now" entry={state.current} now={now} live extras={active} />
          {state.next && <EntryCard eyebrow="Next up" entry={state.next} now={now} />}
        </>
      )}

      {state.phase === "between" && (
        <>
          <Countdown target={state.next.start} now={now} label="Day 2 starts in" />
          <EntryCard eyebrow="Next up" entry={state.next} now={now} />
        </>
      )}

      {state.phase === "after" && (
        <div className="links-card text-center">
          <p className="links-eyebrow">Thank you</p>
          <h2 className="mt-2 text-xl font-semibold text-white">See you at ALPS 2027</h2>
          <p className="mt-2 text-sm text-white/70">
            Thank you for being part of the sixth ALPS Conference.
          </p>
        </div>
      )}
    </section>
  );
}

function AccordionItem({
  id,
  group,
  summary,
  children,
  disabled,
}: {
  id: string;
  group: string;
  summary: ReactNode;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <details id={id} name={group} className={`links-acc ${disabled ? "links-acc--muted" : ""}`}>
      <summary className="links-acc__summary">
        {summary}
        <ChevronDown className="links-acc__chevron h-4 w-4 shrink-0 text-white/45" aria-hidden />
      </summary>
      <div className="links-acc__body">{children}</div>
    </details>
  );
}

function ActionLink({ action, secondary }: { action: QuickLinkAction; secondary?: boolean }) {
  if (!action.href) {
    return (
      <span className="links-button links-button--ghost cursor-default opacity-60" aria-disabled="true">
        {action.label} · coming soon
      </span>
    );
  }
  return (
    <a
      className={`links-button ${secondary ? "links-button--ghost" : ""}`}
      href={action.internal ? withBase(action.href) : action.href}
      {...(action.internal ? {} : { target: "_blank", rel: "noopener noreferrer" })}
    >
      {action.label}
      {!action.internal && <ArrowUpRight className="h-4 w-4" aria-hidden />}
    </a>
  );
}

function VenueMap() {
  if (VENUE_MAP_IMAGE) {
    return (
      <img
        src={withBase(VENUE_MAP_IMAGE)}
        alt="Floor plan of the Kultur & Kongresshaus Aarau"
        className="w-full rounded-xl border border-white/10"
      />
    );
  }
  return (
    <div className="links-map-placeholder" role="img" aria-label="Venue floor plan coming soon">
      <MapPin className="h-6 w-6 text-support-light" aria-hidden />
      <span className="font-semibold text-white">Venue floor plan</span>
      <span className="text-xs text-white/55">Coming soon — rooms, info table and facilities</span>
    </div>
  );
}

function WifiDetails() {
  const [copied, setCopied] = useState(false);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(WIFI.password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the password stays visible.
    }
  };

  if (!WIFI.network) {
    return <p className="text-sm text-white/70">The wifi details are shared at the venue.</p>;
  }

  return (
    <div className="space-y-3">
      <dl className="links-details">
        <div><dt>Network</dt><dd>{WIFI.network}</dd></div>
        {WIFI.password && <div><dt>Password</dt><dd className="font-mono">{WIFI.password}</dd></div>}
      </dl>
      {WIFI.password && (
        <button type="button" onClick={copyPassword} className="links-button mt-2" aria-live="polite">
          {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied ? "Password copied" : "Copy password"}
        </button>
      )}
    </div>
  );
}

function QuickLinks({ now }: { now: Date }) {
  const links = QUICK_LINKS.filter(
    (link) =>
      (!link.showFrom || now >= new Date(link.showFrom)) &&
      (!link.showUntil || now < new Date(link.showUntil)),
  );

  return (
    <section aria-labelledby="links-heading">
      <h2 id="links-heading" className="sr-only">Quick links</h2>
      <div className="space-y-2.5">
        {links.map((link) => {
          const Icon = ICONS[link.icon];
          return (
            <AccordionItem
              key={link.id}
              id={link.id}
              group="quick-links"
              summary={
                <>
                  <span className="links-icon"><Icon className="h-5 w-5" aria-hidden /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{link.label}</span>
                    <span className="block text-sm text-white/60">{link.summary}</span>
                  </span>
                </>
              }
            >
              <div className="space-y-4">
                {link.media === "venue-map" && <VenueMap />}
                {link.media === "wifi" && <WifiDetails />}
                {link.body && <p className="text-sm leading-relaxed text-white/75">{link.body}</p>}
                {link.details && (
                  <dl className="links-details">
                    {link.details.map((d) => (
                      <div key={d.label}><dt>{d.label}</dt><dd>{d.value}</dd></div>
                    ))}
                  </dl>
                )}
                {link.actions && (
                  <div className="flex flex-col gap-2 pt-2">
                    {link.actions.map((action, i) => (
                      <ActionLink key={action.label} action={action} secondary={i > 0} />
                    ))}
                  </div>
                )}
              </div>
            </AccordionItem>
          );
        })}
      </div>
    </section>
  );
}

function availabilityLabel(availability?: SignupAvailability[string]) {
  if (!availability) return null;
  const left = availability.capacity - availability.confirmed;
  if (left > 0) return `${left} of ${availability.capacity} spots left`;
  return availability.waitlist ? `Full · ${availability.waitlist} on the waitlist` : "Full · waitlist open";
}

function Description({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 260;
  return (
    <div>
      <p className={`text-sm leading-relaxed text-white/75 ${long && !expanded ? "line-clamp-4" : ""}`}>{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-sm font-medium text-white underline underline-offset-4"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}

function SignupPanel({
  session,
  availability,
  own,
  closed,
  onSignedUp,
  onCancelled,
}: {
  session: ExperienceSession;
  availability?: SignupAvailability[string];
  own?: StoredSignup;
  closed: boolean;
  onSignedUp: (signup: StoredSignup | (SignupResult & { alreadySignedUp: true })) => void;
  onCancelled: (experienceId: string) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const full = availability ? availability.confirmed >= availability.capacity : false;
  const fieldId = (name: string) => `${session.id}-${name}`;

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError(null);
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          experienceId: session.id,
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          company: form.get("company"),
        }),
      });
      const data = (await response.json()) as SignupResult & {
        error?: string;
        alreadySignedUp?: true;
        cancelToken?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Something went wrong, please try again.");
      if (data.alreadySignedUp) {
        setNotice(
          data.status === "confirmed"
            ? "This name is already on the list — the spot is confirmed."
            : `This name is already on the waitlist, at position ${data.waitlistPosition}.`,
        );
        onSignedUp({ ...data, alreadySignedUp: true });
        return;
      }
      onSignedUp({
        ...data,
        cancelToken: data.cancelToken ?? "",
        firstName: String(form.get("firstName")),
        lastName: String(form.get("lastName")),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong, please try again.");
    } finally {
      setPending(false);
    }
  };

  const cancel = async () => {
    if (!own) return;
    setPending(true);
    setError(null);
    try {
      const response = await fetch(API, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ signupId: own.signupId, cancelToken: own.cancelToken }),
      });
      if (!response.ok && response.status !== 404) {
        throw new Error(((await response.json()) as { error?: string }).error ?? "Could not cancel, please try again.");
      }
      onCancelled(session.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not cancel, please try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      {session.description && <Description text={session.description} />}

      {own ? (
        <>
          <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4 text-sm text-white/85">
            <p className="flex items-center gap-2 font-semibold text-white">
              <Check className="h-4 w-4 text-support-light" aria-hidden />
              {own.status === "confirmed" ? "Your spot is confirmed" : `You're #${own.waitlistPosition} on the waitlist`}
            </p>
            <p className="mt-1">
              Signed up as {own.firstName} {own.lastName}.
              {own.status === "confirmed"
                ? " Please arrive a few minutes early."
                : " We move you up automatically when a spot frees — check back here."}
            </p>
          </div>
          {!closed && (
            <button type="button" onClick={cancel} disabled={pending} className="links-button links-button--ghost mt-2">
              {pending ? "Cancelling…" : "Cancel my spot"}
            </button>
          )}
        </>
      ) : closed ? (
        <p className="text-sm text-white/60">Sign-up for this session has closed.</p>
      ) : notice ? (
        <p className="rounded-xl border border-white/15 bg-white/[0.06] p-4 text-sm text-white/85">{notice}</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <p className="flex items-center gap-2 text-sm text-white/65">
            <Users className="h-4 w-4" aria-hidden />
            {availabilityLabel(availability) ?? `${session.capacity} spots`}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <label htmlFor={fieldId("first")} className="block text-sm text-white/75">
              First name
              <input id={fieldId("first")} name="firstName" required maxLength={60} autoComplete="given-name" className="links-input" />
            </label>
            <label htmlFor={fieldId("last")} className="block text-sm text-white/75">
              Last name
              <input id={fieldId("last")} name="lastName" required maxLength={60} autoComplete="family-name" className="links-input" />
            </label>
          </div>
          <input name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <button type="submit" disabled={pending} className="links-button mt-2">
            {pending ? "Saving…" : full ? "Join the waitlist" : "Save my spot"}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-accent-light" role="alert">{error}</p>}
    </div>
  );
}

function ExperiencesSection({
  now,
  availability,
  mine,
  onSignedUp,
  onCancelled,
}: {
  now: Date;
  availability: SignupAvailability | null;
  mine: Record<string, StoredSignup>;
  onSignedUp: (signup: StoredSignup | (SignupResult & { alreadySignedUp: true })) => void;
  onCancelled: (experienceId: string) => void;
}) {
  const days = useMemo(() => {
    const byDay = new Map<string, ExperienceSession[]>();
    for (const s of EXPERIENCE_SESSIONS) {
      if (!s.signup) continue;
      byDay.set(s.day, [...(byDay.get(s.day) ?? []), s]);
    }
    for (const list of byDay.values()) {
      list.sort((a, b) => (a.start?.getTime() ?? 0) - (b.start?.getTime() ?? 0));
    }
    return [...byDay.entries()];
  }, []);
  const isPast = (session: ExperienceSession) => (session.end ? now >= session.end : false);
  const upcomingDays = days
    .map(([day, sessions]) => [day, sessions.filter((session) => !isPast(session))] as const)
    .filter(([, sessions]) => sessions.length > 0);
  const past = days.flatMap(([, sessions]) => sessions.filter(isPast));

  const renderSession = (session: ExperienceSession) => {
    const own = mine[session.id];
    const ended = isPast(session);
    const started = session.start ? now >= session.start : false;
    const label = availabilityLabel(availability?.[session.id]);
    const portrait = session.personName ? EXPERIENCE_PORTRAITS[session.personName] : undefined;
    return (
      <AccordionItem
        key={session.id}
        id={session.id}
        group="experiences"
        disabled={ended}
        summary={
          <>
            {portrait ? (
              <img
                src={withBase(`img/experiences/${portrait.file}`)}
                alt=""
                loading="lazy"
                className="links-thumb"
                style={{ objectPosition: portrait.position }}
              />
            ) : (
              <span className="links-thumb links-icon"><Users className="h-5 w-5" aria-hidden /></span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug text-white">{session.title}</span>
              <span className="mt-0.5 block text-sm text-white/85">
                <span className="font-semibold tabular-nums">{session.time}</span>
                {session.venue && <span className="text-white/60"> · {session.venue}</span>}
              </span>
              {session.personName && <span className="block text-sm text-white/60">{session.personName}</span>}
              <span className="mt-1 block text-xs text-white/50">
                {ended ? "Ended" : started ? "Happening now" : own ? label : label ? `${label} · Sign up` : "Sign up"}
              </span>
            </span>
            {own && (
              <span className={`links-chip ${own.status === "confirmed" ? "links-chip--ok" : ""}`}>
                <Check className="h-3.5 w-3.5" aria-hidden />
                {own.status === "confirmed" ? "You're in" : `Waitlist #${own.waitlistPosition}`}
              </span>
            )}
          </>
        }
      >
        <SignupPanel
          session={session}
          availability={availability?.[session.id]}
          own={own}
          closed={started}
          onSignedUp={onSignedUp}
          onCancelled={onCancelled}
        />
      </AccordionItem>
    );
  };
  // The afterparty has its own quick link above.
  const dropIns = EXPERIENCE_SESSIONS.filter(
    (s, i, all) =>
      !s.signup && s.title !== "Afterparty" && all.findIndex((o) => o.title === s.title) === i,
  );

  return (
    <section aria-labelledby="experiences-heading" className="space-y-4">
      <div>
        <p className="links-eyebrow">Experiences</p>
        <h2 id="experiences-heading" className="mt-1 text-2xl font-semibold text-white">Save your spot</h2>
        <p className="mt-1 text-sm text-white/65">
          Places are limited. When a session is full, join the waitlist and we move you up as spots free.
        </p>
      </div>

      {upcomingDays.map(([day, sessions]) => (
        <div key={day}>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/55">{day}</h3>
          <div className="space-y-2">{sessions.map(renderSession)}</div>
        </div>
      ))}

      {past.length > 0 && (
        <details className="links-past">
          <summary className="links-past__summary">
            <span>Past sessions ({past.length})</span>
            <ChevronDown className="links-acc__chevron h-4 w-4" aria-hidden />
          </summary>
          <div className="mt-2 space-y-2">{past.map(renderSession)}</div>
        </details>
      )}

      {dropIns.length > 0 && (
        <div className="links-card">
          <p className="links-eyebrow">Drop in, no sign-up needed</p>
          <ul className="mt-3 space-y-2 text-sm">
            {dropIns.map((s) => (
              <li key={s.id} className="flex justify-between gap-3">
                <span className="font-medium text-white">{s.title}</span>
                <span className="text-right text-white/60">
                  {s.time === "All day" ? "Both days, all day" : `${s.day} · ${s.time}`}
                  {s.venue ? ` · ${s.venue}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function LinksPage() {
  const clock = useConferenceClock();
  const [availability, setAvailability] = useState<SignupAvailability | null>(null);
  const [mine, setMine] = useState<Record<string, StoredSignup>>({});

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(API);
      if (response.ok) {
        setAvailability(((await response.json()) as { availability: SignupAvailability }).availability);
      }
    } catch {
      // Offline: keep the last known counts.
    }
  }, []);

  useEffect(() => {
    const stored = readStored();
    setMine(stored);
    refresh();
    const timer = window.setInterval(refresh, 60_000);

    // Refresh our own statuses, e.g. a waitlist spot that got promoted.
    const signups = Object.values(stored);
    if (signups.length) {
      fetch(`${API}/mine`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          signups: signups.map(({ signupId, cancelToken }) => ({ signupId, cancelToken })),
        }),
      })
        .then((r) => (r.ok ? (r.json() as Promise<{ signups: SignupResult[] }>) : null))
        .then((data) => {
          if (!data) return;
          const byId = new Map(data.signups.map((s) => [s.signupId, s]));
          const next: Record<string, StoredSignup> = {};
          for (const [id, signup] of Object.entries(stored)) {
            const fresh = byId.get(signup.signupId);
            if (fresh) next[id] = { ...signup, ...fresh };
          }
          writeStored(next);
          setMine(next);
        })
        .catch(() => {});
    }

    return () => window.clearInterval(timer);
  }, [refresh]);

  // Open the item named in the URL hash, e.g. /links#afterparty, once the clock has rendered it.
  useEffect(() => {
    if (!clock) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    const item = id ? document.getElementById(id) : null;
    if (item instanceof HTMLDetailsElement && !item.open) {
      item.open = true;
      item.scrollIntoView({ block: "center" });
    }
  }, [Boolean(clock)]);

  const handleSignedUp = (signup: StoredSignup | (SignupResult & { alreadySignedUp: true })) => {
    if ("cancelToken" in signup) {
      const next = { ...mine, [signup.experienceId]: signup };
      writeStored(next);
      setMine(next);
    }
    refresh();
  };

  const handleCancelled = (experienceId: string) => {
    const { [experienceId]: _removed, ...rest } = mine;
    writeStored(rest);
    setMine(rest);
    refresh();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-4 pb-12 pt-10">
      <header className="text-center">
        <a href={withBase("/")} className="inline-block">
          <img src={withBase("img/logo.png")} alt="ALPS" className="mx-auto h-9 w-auto" />
        </a>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-white">ALPS Conference 2026</h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-white/65">
          <Clock className="h-3.5 w-3.5" aria-hidden />
          9–10 October 2026 · Kultur & Kongresshaus Aarau
        </p>
      </header>

      {clock ? (
        <StatusSection now={clock.now} travelling={clock.travelling} />
      ) : (
        <div className="links-card h-32 animate-pulse" aria-hidden />
      )}

      <QuickLinks now={clock?.now ?? new Date()} />

      <ExperiencesSection
        now={clock?.now ?? new Date()}
        availability={availability}
        mine={mine}
        onSignedUp={handleSignedUp}
        onCancelled={handleCancelled}
      />

      <footer className="mt-auto text-center text-sm text-white/50">
        <a href={withBase("/")} className="hover:text-white">alpsconference.com</a>
        {" · "}
        <a href="https://www.alps.foundation/" target="_blank" rel="noopener noreferrer" className="hover:text-white">
          ALPS Foundation
        </a>
      </footer>

    </div>
  );
}
