import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Maximize,
  Minimize,
  MessageCircleQuestion,
  Mic,
  PartyPopper,
  Radio,
  Sparkles,
  Users,
  Utensils,
  Wine,
  X,
  type LucideIcon,
} from "lucide-react";
import { getConferenceState, parseTimeTravel, TIMELINE, type TimelineEntry } from "../data/conferenceTimeline";
import { EXPERIENCE_PORTRAITS } from "../data/experiences";
import { PROGRAM, type ProgramItem } from "../data/program";
import {
  FRIDAY_PANEL_SPEAKER_NAMES,
  getFaceCenter,
  getImageCrop,
  SATURDAY_PANEL_SPEAKER_NAMES,
  speakerByName,
  speakersNamed,
  type Speaker,
} from "../data/speakers";
import { withBase } from "../lib/withBase";
import ParticlesCanvas from "./ParticlesCanvas";
import SynapseIllustration from "./SynapseIllustration";

// Turns slowly about its axis in the upper right; the message sits below, on the left.
const SYNAPSE_OPTIONS = { spin: 0.1, zoom: 0.7, shiftX: 0.2, shiftY: 0.2 };
// The synapse's centre on screen; the background glow and the pink particle
// cluster follow it.
const GLOW_CENTER = [0.5 + SYNAPSE_OPTIONS.shiftX, 0.5 - SYNAPSE_OPTIONS.shiftY] as const;

// Projector screen for between sessions and question rounds. It follows the
// clock by default; the schedule drawer (hover to reveal its button) pins what
// is happening now. Test with ?time=yyyy-mm-dd-hh-mm (as on /links) and
// ?item=<timeline id> (what the drawer pins).

const IDLE_MS = 2500;

/* ---------- Clock and pinned item ---------- */

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const travel = parseTimeTravel(new URLSearchParams(window.location.search).get("time"));
    const offset = travel ? travel.getTime() - Date.now() : 0;
    const tick = () => setNow(new Date(Date.now() + offset));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function usePinnedItem() {
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("item");
    if (id && TIMELINE.some((e) => e.id === id)) setPinnedId(id);
  }, []);

  const pin = useCallback((id: string | null) => {
    setPinnedId(id);
    const url = new URL(window.location.href);
    if (id) url.searchParams.set("item", id);
    else url.searchParams.delete("item");
    window.history.replaceState(null, "", url);
  }, []);

  return [pinnedId, pin] as const;
}

/* ---------- Schedule helpers ---------- */

const timeFormat = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit" });
const zurichDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" });

const formatRange = (e: TimelineEntry) => `${timeFormat.format(e.start)}–${timeFormat.format(e.end)}`;

/** The program row behind a timeline entry (ids are `<date>-<index>`). */
function programItem(entry: TimelineEntry): ProgramItem | undefined {
  const date = entry.id.slice(0, 10);
  const index = Number(entry.id.slice(11));
  return PROGRAM.find((day) => day.dateTime === date)?.items[index];
}

type Person = { name: string; src: string; position: string; scale?: number; origin?: string; note?: string };

function speakerPerson(speaker: Speaker): Person {
  const crop = getImageCrop(speaker.image);
  return {
    name: speaker.name,
    src: withBase(`img/speakers/${speaker.image}`),
    position: crop.position,
    scale: crop.scale,
    origin: getFaceCenter(crop.faceBox),
    note: speaker.institution,
  };
}

function peopleFor(item: ProgramItem | undefined): Person[] {
  if (!item) return [];
  if (item.panel) {
    const names = item.panel === "friday" ? FRIDAY_PANEL_SPEAKER_NAMES : SATURDAY_PANEL_SPEAKER_NAMES;
    return speakersNamed(names).filter((s) => s.image).map(speakerPerson);
  }
  const speaker = item.speakerName ? speakerByName(item.speakerName) : undefined;
  return speaker?.image ? [speakerPerson(speaker)] : [];
}

const isTalk = (entry: TimelineEntry) => entry.kind === "session" && !!entry.detail && entry.detail !== "ALPS team";

function iconFor(entry: TimelineEntry): LucideIcon {
  if (/lunch|dinner/i.test(entry.title)) return Utensils;
  if (/apéro/i.test(entry.title)) return Wine;
  if (/afterparty/i.test(entry.title)) return PartyPopper;
  if (entry.kind === "pause") return Coffee;
  if (entry.kind === "social") return Sparkles;
  if (/panel/i.test(entry.title)) return Users;
  return Mic;
}

/* ---------- What the screen says ---------- */

type Message = {
  eyebrow?: string;
  headline: string;
  sub?: string;
  highlight?: string;
  people?: Person[];
  icon?: LucideIcon;
};

function messageFor(current: TimelineEntry | undefined, next: TimelineEntry | undefined, now: Date): Message {
  if (!current) {
    if (!next) return { eyebrow: "ALPS Conference 2026", headline: "Thank you for coming!", sub: "See you next year", icon: Sparkles };
    if (next === TIMELINE[0]) return { eyebrow: "ALPS Conference 2026", headline: "Welcome", sub: "Kultur & Kongresshaus Aarau", icon: Sparkles };
    const sameDay = zurichDay.format(now) === zurichDay.format(next.start);
    return { eyebrow: "ALPS Conference 2026", headline: sameDay ? "Welcome back" : "See you tomorrow", icon: Sparkles };
  }

  const item = programItem(current);
  const highlight = item?.detailHighlight ? current.detail : undefined;
  const firstDay = current.id.startsWith(TIMELINE[0].id.slice(0, 10));

  if (current.title === "Doors open")
    return { eyebrow: current.title, headline: firstDay ? "Welcome" : "Welcome back", sub: current.menuNote, icon: Coffee };
  if (/lunch|dinner/i.test(current.title))
    return { eyebrow: current.title, headline: "Bon appétit!", sub: current.menuNote, highlight, icon: Utensils };
  if (current.kind === "pause")
    return { eyebrow: current.title, headline: "Enjoy the break", sub: current.menuNote, highlight, icon: Coffee };
  if (/apéro/i.test(current.title)) return { eyebrow: current.title, headline: "Santé!", icon: Wine };
  if (/afterparty/i.test(current.title))
    return { eyebrow: "Tonight", headline: "See you at the afterparty", sub: current.detail, icon: PartyPopper };
  if (current.kind === "social") return { eyebrow: current.title, headline: "Enjoy the evening", icon: Sparkles };
  if (current.title === "Opening") return { eyebrow: "Opening", headline: "Welcome", sub: current.detail, icon: Sparkles };
  if (/closing/i.test(current.title)) return { eyebrow: current.title, headline: "Thank you", sub: current.detail, icon: Sparkles };
  if (item?.panel)
    return { eyebrow: "Panel discussion · Q&A", headline: current.detail ?? current.title, people: peopleFor(item), icon: Users };
  if (isTalk(current))
    return { eyebrow: "Questions & answers", headline: current.detail!, people: peopleFor(item), icon: MessageCircleQuestion };
  return { eyebrow: current.title, headline: current.detail ?? current.title };
}

function formatCountdown(ms: number): string | null {
  if (ms <= 0) return null;
  const total = Math.ceil(ms / 1000);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

/* ---------- Pieces ---------- */

function Portrait({ person, className = "" }: { person: Person; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className={`break-portrait ${className}`}>
      <div className="h-full w-full" style={{ transform: `scale(${person.scale ?? 1})`, transformOrigin: person.origin }}>
        <img
          src={person.src}
          alt=""
          className="h-full w-full object-cover"
          style={{ objectPosition: person.position }}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}

function Experiences({ item }: { item: ProgramItem | undefined }) {
  const list = item?.experiences ?? [];
  if (!list.length) return null;
  return (
    <ul className="break-experiences">
      {list.map((xp) => {
        const portrait = EXPERIENCE_PORTRAITS[xp.personName];
        return (
          <li key={`${xp.title}-${xp.time}`} className="break-chip">
            {portrait && (
              <Portrait
                className="break-portrait--chip"
                person={{ name: xp.personName, src: withBase(`img/experiences/${portrait.file}`), position: portrait.position }}
              />
            )}
            <span>
              <strong>{xp.title}</strong> · {xp.time} · {xp.personName}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function NextUp({ entry, now }: { entry: TimelineEntry; now: Date }) {
  const item = programItem(entry);
  const people = peopleFor(item);
  const Icon = iconFor(entry);
  const countdown = formatCountdown(entry.start.getTime() - now.getTime());
  const talk = isTalk(entry);
  const title = talk || item?.panel ? entry.detail : entry.title;
  const byline = item?.panel
    ? people.map((p) => p.name).join(" · ")
    : talk
      ? `${entry.title}${people[0]?.note ? ` · ${people[0].note}` : ""}`
      : entry.detail && entry.detail !== entry.title
        ? entry.detail
        : entry.menuNote;
  const sameDay = zurichDay.format(now) === zurichDay.format(entry.start);

  return (
    <section className="break-next" aria-label="Next up">
      <div className="break-next__media">
        {people.length > 0 ? (
          <div className="break-next__faces">
            {people.slice(0, 4).map((p) => (
              <Portrait key={p.name} person={p} className={people.length > 1 ? "break-portrait--stack" : "break-portrait--lead"} />
            ))}
          </div>
        ) : (
          <div className="break-next__icon">
            <Icon aria-hidden />
          </div>
        )}
      </div>
      <div className="break-next__body">
        <p className="break-eyebrow">
          Next up
          <span className="break-next__time">
            {sameDay ? "" : `${entry.day} · `}
            {formatRange(entry)}
          </span>
        </p>
        <h2 className="break-next__title">{title}</h2>
        {byline && <p className="break-next__byline">{byline}</p>}
      </div>
      <div className="break-next__timer" role="timer" aria-live="off">
        {countdown ? (
          <>
            <span className="break-eyebrow">Starts in</span>
            <span className="break-next__count">{countdown}</span>
          </>
        ) : (
          <span className="break-next__count break-next__count--now">
            <span className="break-live-dot" aria-hidden />
            Now
          </span>
        )}
      </div>
    </section>
  );
}

function ScheduleDrawer({
  open,
  onClose,
  pinnedId,
  liveId,
  onPin,
  fullscreen,
  onFullscreen,
}: {
  open: boolean;
  onClose: () => void;
  pinnedId: string | null;
  liveId?: string;
  onPin: (id: string | null) => void;
  fullscreen: boolean;
  onFullscreen: () => void;
}) {
  const days = useMemo(
    () => [...new Set(TIMELINE.map((e) => e.day))].map((day) => ({ day, entries: TIMELINE.filter((e) => e.day === day) })),
    [],
  );

  return (
    <div className={`break-drawer ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="break-drawer__backdrop" onClick={onClose} />
      <div className="break-drawer__panel" role="dialog" aria-modal="true" aria-label="Choose what's on now">
        <header className="break-drawer__header">
          <div>
            <h2 className="text-xl font-semibold text-white">What's on now?</h2>
            <p className="text-sm text-white/55">
              Pick the item the room is in; the screen shows what comes after it. ← → step through, F for full screen.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className={`break-button ${pinnedId ? "" : "is-active"}`}
              onClick={() => {
                onPin(null);
                onClose();
              }}
            >
              <Radio className="h-4 w-4" aria-hidden />
              Follow the clock
            </button>
            <button type="button" className="break-button" onClick={onFullscreen}>
              {fullscreen ? <Minimize className="h-4 w-4" aria-hidden /> : <Maximize className="h-4 w-4" aria-hidden />}
              {fullscreen ? "Exit full screen" : "Full screen"}
            </button>
            <button type="button" className="break-button break-button--icon" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </header>
        <div className="break-drawer__days">
          {days.map(({ day, entries }) => (
            <div key={day}>
              <h3 className="break-eyebrow mb-2">{day}</h3>
              <ul className="space-y-1">
                {entries.map((entry) => {
                  const Icon = iconFor(entry);
                  const talk = isTalk(entry);
                  const shown = pinnedId ? entry.id === pinnedId : entry.id === liveId;
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`break-drawer__item ${shown ? "is-shown" : ""} ${entry.kind !== "session" ? "is-pause" : ""}`}
                        onClick={() => {
                          onPin(entry.id);
                          onClose();
                        }}
                      >
                        <span className="tabular-nums text-white/55">{timeFormat.format(entry.start)}</span>
                        <Icon className="h-4 w-4 shrink-0 text-white/45" aria-hidden />
                        <span className="min-w-0 flex-1 truncate">
                          {talk ? <>{entry.title} <span className="text-white/50">· {entry.detail}</span></> : entry.title}
                        </span>
                        {entry.id === liveId && <span className="break-tag">Live</span>}
                        {pinnedId === entry.id && <span className="break-tag break-tag--pinned">Showing</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Page ---------- */

export default function BreakScreen() {
  const now = useClock();
  const [pinnedId, pin] = usePinnedItem();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [synapseFailed, setSynapseFailed] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Reveal the schedule button (and the cursor) only while the mouse moves.
  useEffect(() => {
    let timer = 0;
    const wake = () => {
      setActive(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setActive(false), IDLE_MS);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("pointerdown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("pointerdown", wake);
    };
  }, []);

  useEffect(() => {
    const sync = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.().catch(() => {});
  }, []);

  const live = now ? getConferenceState(now) : null;
  const liveId = live?.phase === "live" ? live.current.id : undefined;
  const pinned = pinnedId ? TIMELINE.find((e) => e.id === pinnedId) : undefined;

  let current: TimelineEntry | undefined;
  let next: TimelineEntry | undefined;
  if (pinned) {
    current = pinned;
    next = TIMELINE[TIMELINE.indexOf(pinned) + 1];
  } else if (live && live.phase !== "after") {
    current = live.phase === "live" ? live.current : undefined;
    next = live.next;
  }

  // Step the pinned item through the schedule. Between items (or after the
  // last one) "now" sits half a step before the next one.
  const position = current ? TIMELINE.indexOf(current) : next ? TIMELINE.indexOf(next) - 0.5 : TIMELINE.length - 0.5;
  const prevEntry = TIMELINE[Math.ceil(position - 1)];
  const nextEntry = TIMELINE[Math.floor(position + 1)];
  const step = useCallback(
    (dir: 1 | -1) => {
      const target = dir > 0 ? nextEntry : prevEntry;
      if (target) pin(target.id);
    },
    [nextEntry, prevEntry, pin],
  );

  // Keyboard: ← → step the pinned item, F toggles full screen, Esc closes the drawer.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") setDrawerOpen(false);
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, toggleFullscreen]);

  const message = now ? messageFor(current, next, now) : null;
  const Icon = message?.icon;
  const messageKey = `${current?.id ?? "none"}-${next?.id ?? "none"}`;
  const long = (message?.headline.length ?? 0) > 32;

  return (
    <div ref={rootRef} className={`break-screen ${active || drawerOpen ? "" : "is-idle"}`}>
      <div className="absolute inset-0" aria-hidden>
        {/* Oversized so its radial glow can sit on the synapse and still cover the screen. */}
        <img
          src={withBase("img/background.jpg")}
          alt=""
          className="absolute h-[150%] w-[150%] max-w-none object-cover"
          style={{ left: `${(GLOW_CENTER[0] - 0.75) * 100}%`, top: `${(GLOW_CENTER[1] - 0.75) * 100}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/40 via-neutral-dark/10 to-neutral-dark/80" />
        <ParticlesCanvas variant="hero" scale={1.6} center={GLOW_CENTER} />
      </div>
      {synapseFailed ? (
        <div className="break-bones" aria-hidden>
          <img src={withBase("img/bones.png")} alt="" />
        </div>
      ) : (
        <SynapseIllustration
          className="opacity-90"
          options={SYNAPSE_OPTIONS}
          replayKey={now ? messageKey : undefined}
          interactionTarget={rootRef}
          onUnsupported={() => setSynapseFailed(true)}
        />
      )}
      <div className="break-vignette" aria-hidden />

      <header className="break-top">
        <div className="break-brand">
          <img src={withBase("img/logo.png")} alt="ALPS Conference 2026" className="break-logo" />
          <div className="break-sponsor">
            <span className="break-sponsor__label">With thanks to our sponsor</span>
            <img
              src={withBase("img/booklet/logos/csm.webp")}
              alt="Fondation Conscience et Santé Mentale"
              className="break-sponsor__logo"
            />
          </div>
        </div>
        {now && (
          <p className="break-clock">
            <CalendarDays aria-hidden />
            <span>{timeFormat.format(now)}</span>
          </p>
        )}
      </header>

      <main className="break-main">
        {message && (
          <div key={messageKey} className="break-message">
            {message.eyebrow && (
              <p className="break-message__eyebrow">
                {Icon && <Icon aria-hidden />}
                {message.eyebrow}
              </p>
            )}
            <h1 className={`break-message__headline ${long ? "is-long" : ""}`}>{message.headline}</h1>
            {message.people && message.people.length > 0 && (
              <ul className="break-message__people">
                {message.people.map((p) => (
                  <li key={p.name}>
                    <Portrait person={p} className="break-portrait--chip" />
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
            {message.highlight && <p className="break-message__highlight">{message.highlight}</p>}
            {message.sub && <p className="break-message__sub">{message.sub}</p>}
            <Experiences item={current ? programItem(current) : undefined} />
          </div>
        )}
      </main>

      <footer className="break-bottom">
        <div className="min-w-0 flex-1">
          {now && next && (
            <div key={next.id} className="break-fade">
              <NextUp entry={next} now={now} />
            </div>
          )}
        </div>
        {/* Shown while the mouse moves (or on hover): step through the schedule, or open it. */}
        <nav className={`break-pager ${active || drawerOpen ? "is-visible" : ""}`} aria-label="Schedule">
          <button type="button" onClick={() => step(-1)} disabled={!prevEntry} title="Previous item (←)" aria-label="Previous item">
            <ChevronLeft aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            title={pinned ? "Schedule (pinned)" : "Schedule"}
            aria-label="Open the schedule"
          >
            <CalendarDays aria-hidden />
            {pinned && <span className="break-pager__dot" aria-hidden />}
          </button>
          <button type="button" onClick={() => step(1)} disabled={!nextEntry} title="Next item (→)" aria-label="Next item">
            <ChevronRight aria-hidden />
          </button>
        </nav>
      </footer>

      <ScheduleDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pinnedId={pinnedId}
        liveId={liveId}
        onPin={pin}
        fullscreen={fullscreen}
        onFullscreen={toggleFullscreen}
      />
    </div>
  );
}
