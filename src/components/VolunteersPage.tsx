import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { CircleHelp, Info, MapPin, Moon, Sun, SunMoon, Users, type LucideIcon } from "lucide-react";
import CalendarSubscribe from "./CalendarSubscribe";
import CrewBuild from "./CrewBuild";
import { useCrewBuild } from "./useCrewBuild";
import { BUILD_PHASES } from "../data/crewBuild";
import { BUILD_DAYS, personBuild, type PersonBuildEntry } from "../lib/crewBuild";
import { parseTimeTravel } from "../data/conferenceTimeline";
import {
  COUNTING_RULE,
  CREW_CONTACTS,
  VOLUNTEER_TASK_ORDER,
  VOLUNTEER_TASKS,
  type CateringShift,
  type CrewEvent,
  type ShiftSlot,
  type VolunteerTask,
} from "../data/volunteers";
import {
  blockMinutes,
  CATERING_DAYS,
  cateringFor,
  cateringRows,
  countedMinutes,
  CREW_TEAM,
  CREW_VOLUNTEERS,
  crewEventEnd,
  crewEventsFor,
  formatDuration,
  formatTime,
  PLAN_DAYS,
  registerAddedPeople,
  shiftBlocks,
  slotPrograms,
  teamPhoto,
  toMinutes,
  volunteerCalendarPath,
  volunteerFromSlug,
  volunteerSlug,
  type CateringRow,
  type PlanDay,
  type ShiftBlock,
} from "../lib/volunteers";
import { useKeepInViewport } from "../lib/keepInViewport";
import { withBase } from "../lib/withBase";
import "../styles/volunteers.css";

const STORAGE_KEY = "alps-volunteer-2026";
const THEME_KEY = "alps-volunteer-theme";
const TZID = "Europe/Zurich";
const DEFAULT_DAY = "2026-10-09";
/** `?day=thu` (or a date) opens that tab, e.g. from the old setup page's address. */
const DAY_PARAMS: Record<string, string> = {
  thu: "2026-10-08",
  fri: "2026-10-09",
  sat: "2026-10-10",
  sun: "2026-10-11",
  "fri-catering": "2026-10-09-catering",
  "sat-catering": "2026-10-10-catering",
};
const CATERING_SUFFIX = "-catering";

type ThemePref = "auto" | "light" | "dark";

declare global {
  interface Window {
    /** Set up by the inline script in volunteers.astro, which applies the theme before first paint. */
    alpsVolunteerTheme?: { set(pref: ThemePref): void };
  }
}

const THEMES: { id: ThemePref; label: string; icon: LucideIcon }[] = [
  { id: "auto", label: "Auto", icon: SunMoon },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

/** Date and minute of the day at the venue. */
type Clock = { date: string; minutes: number };
type Timing = "past" | "now" | "next";

type AgendaItem =
  | { kind: "shift"; key: string; date: string; start: number; end: number; block: ShiftBlock }
  | { kind: "crew"; key: string; date: string; start: number; end: number; event: CrewEvent; build?: PersonBuildEntry }
  | { kind: "catering"; key: string; date: string; start: number; end: number; shift: CateringShift }
  | { kind: "build"; key: string; date: string; start: number; end: number; entry: PersonBuildEntry };

type PlanRow =
  | { kind: "slot"; key: string; start: number; end: number; slot: ShiftSlot; program: string }
  | { kind: "crew"; key: string; start: number; end: number; event: CrewEvent }
  | { kind: "catering"; key: string; start: number; end: number; row: CateringRow };

/** Schedule tabs: one per plan day, then one per catering day. */
const PLAN_TABS = [
  ...PLAN_DAYS.map((day) => ({ id: day.dateTime, date: day.dateTime, catering: false })),
  ...CATERING_DAYS.map((date) => ({ id: `${date}${CATERING_SUFFIX}`, date, catering: true })),
];

const dateLabelFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const tabLabelFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", timeZone: "UTC" });
const venueFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZID,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const dateLabel = (date: string) => dateLabelFormat.format(new Date(`${date}T12:00:00Z`));
const tabLabel = (date: string) => tabLabelFormat.format(new Date(`${date}T12:00:00Z`));

function venueClock(at: Date): Clock {
  const parts = Object.fromEntries(venueFormat.formatToParts(at).map((part) => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
}

/**
 * Wall-clock time at the venue, whatever the phone's own time zone.
 * Test with ?time=yyyy-mm-dd-hh-mm (as on /slides); the clock keeps running from there.
 */
function useVenueClock() {
  const [clock, setClock] = useState<Clock | null>(null);

  useEffect(() => {
    const travel = parseTimeTravel(new URLSearchParams(window.location.search).get("time"));
    const offset = travel ? travel.getTime() - Date.now() : 0;
    const tick = () => {
      const next = venueClock(new Date(Date.now() + offset));
      setClock((prev) => (prev?.date === next.date && prev.minutes === next.minutes ? prev : next));
    };
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);

  return clock;
}

function timingOf(clock: Clock | null, date: string, start: number, end: number): Timing | undefined {
  if (!clock) return undefined;
  if (date < clock.date || (date === clock.date && end <= clock.minutes)) return "past";
  if (date === clock.date && start <= clock.minutes) return "now";
  return undefined;
}

function readStoredPerson() {
  try {
    return volunteerFromSlug(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function storePerson(person: string | null) {
  try {
    if (person) localStorage.setItem(STORAGE_KEY, volunteerSlug(person));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Private mode or blocked storage: the URL still carries the choice.
  }
}

function agendaFor(person: string, build: PersonBuildEntry[] = []): AgendaItem[] {
  const shifts: AgendaItem[] = PLAN_DAYS.flatMap(({ shiftDay }) =>
    shiftDay
      ? shiftBlocks(shiftDay, person).map((block) => ({
          kind: "shift" as const,
          key: `${shiftDay.id}-${block.start}`,
          date: shiftDay.dateTime,
          start: block.start,
          end: block.end,
          block,
        }))
      : []
  );
  // Teardown sign-ups ride on the plan's own dismantling entry rather than doubling it.
  const teardown = build.find((entry) => entry.phase === "teardown");
  const crew: AgendaItem[] = crewEventsFor(person).map((event) => ({
    kind: "crew" as const,
    key: event.id,
    date: event.dateTime,
    start: toMinutes(event.start),
    end: crewEventEnd(event),
    event,
    build: event.id === "dismantling" ? teardown : undefined,
  }));
  const folded = crew.some((item) => item.kind === "crew" && item.build);
  // Packing the truck has no time yet: it sorts right after the teardown.
  const teardownStart = toMinutes(BUILD_PHASES.teardown.start ?? "21:30");
  const building: AgendaItem[] = build.filter((entry) => !(folded && entry.phase === "teardown")).map((entry) => {
    const start = entry.start ?? teardownStart + 60;
    return { kind: "build" as const, key: `build-${entry.phase}`, date: entry.dateTime, start, end: entry.end ?? start + 60, entry };
  });
  const catering: AgendaItem[] = cateringFor(person).map((shift) => ({
    kind: "catering" as const,
    key: `catering-${shift.dateTime}-${shift.from}-${shift.station}`,
    date: shift.dateTime,
    start: toMinutes(shift.from),
    end: toMinutes(shift.to),
    shift,
  }));
  return [...shifts, ...crew, ...catering, ...building].sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
}

/** Crew events go before the slot that starts at the same time. */
function planRows(day: PlanDay): PlanRow[] {
  const programs = day.shiftDay ? slotPrograms(day.shiftDay) : [];
  const crew: PlanRow[] = day.crew.map((event) => ({
    kind: "crew",
    key: event.id,
    start: toMinutes(event.start),
    end: crewEventEnd(event),
    event,
  }));
  const slots: PlanRow[] = (day.shiftDay?.slots ?? []).map((slot, index) => ({
    kind: "slot",
    key: slot.from,
    start: toMinutes(slot.from),
    end: toMinutes(slot.to),
    slot,
    program: programs[index],
  }));
  return [...crew, ...slots].sort((a, b) => a.start - b.start);
}

function cateringPlanRows(date: string): PlanRow[] {
  return cateringRows(date).map((row) => ({
    kind: "catering",
    key: `${row.from}-${row.to}-${row.station}`,
    start: toMinutes(row.from),
    end: toMinutes(row.to),
    row,
  }));
}

function involves(row: PlanRow, person: string) {
  if (row.kind === "catering") return row.row.people.includes(person);
  return row.kind === "crew"
    ? !row.event.people || row.event.people.includes(person)
    : VOLUNTEER_TASK_ORDER.some((task) => row.slot[task].includes(person));
}

function crewTime(event: CrewEvent) {
  return `${event.approximate ? "≈ " : ""}${event.start}`;
}

function ThemeSwitch() {
  const [pref, setPref] = useState<ThemePref>("auto");

  useEffect(() => {
    const current = document.documentElement.dataset.volThemePref;
    if (current === "light" || current === "dark") setPref(current);
  }, []);

  const choose = (next: ThemePref) => {
    setPref(next);
    try {
      if (next === "auto") localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, next);
    } catch {
      // Blocked storage: the choice still holds until the page is left.
    }
    window.alpsVolunteerTheme?.set(next);
  };

  return (
    <div className="vol-theme" role="radiogroup" aria-label="Theme">
      {THEMES.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" role="radio" aria-checked={pref === id} onClick={() => choose(id)}>
          <Icon size={14} aria-hidden="true" />
          <span className="vol-theme__label">{label}</span>
        </button>
      ))}
    </div>
  );
}

function Avatar({ name, size = 20 }: { name: string; size?: number }) {
  const src = teamPhoto(name);
  if (!src) return null;
  return <img className="vol-avatar" src={src} alt="" width={size} height={size} loading="lazy" decoding="async" />;
}

function NamePill({ name, person, onChoose }: { name: string; person: string | null; onChoose: (name: string) => void }) {
  return (
    <button
      type="button"
      className="vol-name"
      data-me={name === person || undefined}
      data-photo={teamPhoto(name) ? "" : undefined}
      aria-label={`Show ${name}’s shifts`}
      onClick={() => onChoose(name)}
    >
      <Avatar name={name} />
      {name}
    </button>
  );
}

function StateBadge({ timing, clock }: { timing: Timing | undefined; clock: Clock | null }) {
  if (timing === "now") return <span className="vol-state">Now · {clock && formatTime(clock.minutes)}</span>;
  if (timing === "next") return <span className="vol-state vol-state--next">Next</span>;
  return null;
}

function TaskTag({ task }: { task: VolunteerTask }) {
  return (
    <span className="vol-tag" data-task={task}>
      {VOLUNTEER_TASKS[task].label}
    </span>
  );
}

function TaskHeader({ task, open, onToggle }: { task: VolunteerTask; open: boolean; onToggle: () => void }) {
  const info = VOLUNTEER_TASKS[task];
  const id = `vol-task-help-${task}`;
  const popoverRef = useRef<HTMLDivElement>(null);
  useKeepInViewport(popoverRef, open);
  // The icon is glued to the last word, so a label that wraps never leaves it alone on a line.
  const words = info.label.split(" ");
  const last = words.pop();
  return (
    <div className="vol-taskhead" data-task={task}>
      <button type="button" className="vol-taskhead__button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className="vol-taskhead__label">
          {words.length > 0 && `${words.join(" ")} `}
          <span className="vol-taskhead__last">
            {last}
            <CircleHelp size={14} aria-hidden="true" />
          </span>
        </span>
        <span className="sr-only">: what to do</span>
      </button>
      {open && (
        <div ref={popoverRef} id={id} className="vol-popover" role="dialog" aria-label={`${info.label}: what to do`}>
          <p className="vol-popover__title">{info.label}</p>
          <ul>
            {info.duties.map((duty) => (
              <li key={duty}>{duty}</li>
            ))}
          </ul>
          {info.weight !== 1 && (
            <p className="vol-popover__note">
              {info.weight === 0 ? "Not counted in the hours." : "Counts half towards the hours."}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CrewEventLine({ event, person }: { event: CrewEvent; person: string | null }) {
  const others = event.people?.filter((name) => name !== person);
  return (
    <>
      <span className="vol-crew__title">{event.title}</span>
      <span className="vol-crew__meta">
        <MapPin size={13} aria-hidden="true" />
        {event.place}
      </span>
      <span className="vol-crew__meta">
        <Users size={13} aria-hidden="true" />
        {others ? (person && event.people?.includes(person) ? `You, ${others.join(", ")}` : others.join(", ")) : "Everyone"}
      </span>
    </>
  );
}

function MyShifts({
  person,
  clock,
  onPickDay,
  build,
}: {
  person: string;
  clock: Clock | null;
  onPickDay: (date: string) => void;
  build: PersonBuildEntry[];
}) {
  const buildKey = build.map((entry) => `${entry.phase}:${entry.items.map((item) => item.id).join(",")}`).join("|");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => agendaFor(person, build), [person, buildKey]);
  const blocks = items.flatMap((item) => (item.kind === "shift" ? [item.block] : []));
  const cateringMinutes = items.reduce((sum, item) => sum + (item.kind === "catering" ? item.end - item.start : 0), 0);
  const dates = [...new Set(items.map((item) => item.date))];

  const timings = new Map(items.map((item) => [item.key, timingOf(clock, item.date, item.start, item.end)]));
  const next = clock && items.find((item) => !timings.get(item.key));
  if (next) timings.set(next.key, "next");

  return (
    <section id="vol-mine" className="vol-mine" aria-labelledby="vol-mine-title" aria-live="polite">
      <div className="vol-mine__head">
        <div className="vol-mine__who">
          <Avatar name={person} size={44} />
          <div>
            <h2 id="vol-mine-title" className="vol-h2">
              {person}’s shifts
            </h2>
            <p className="vol-mine__stats">
              {blocks.length ? (
                <>
                  {blocks.length} shift{blocks.length === 1 ? "" : "s"} · {formatDuration(blockMinutes(blocks))} on
                  shift · <strong>{formatDuration(countedMinutes(blocks))} counted</strong>
                  {cateringMinutes > 0 && <> · {formatDuration(cateringMinutes)} catering</>}
                </>
              ) : cateringMinutes > 0 ? (
                <>{formatDuration(cateringMinutes)} catering · no shifts in the grid</>
              ) : (
                "No shifts in the grid, only the crew and build times below."
              )}
            </p>
          </div>
        </div>
        <CalendarSubscribe
          path={volunteerCalendarPath(person)}
          label="Add to my calendar"
          note="Subscribing keeps your calendar in sync if the plan changes; Google Calendar can take a few hours for its first sync. A downloaded file stays as it is today."
        />
      </div>

      <div className="vol-mine__days">
        {dates.map((date) => (
          <article key={date} className="vol-day">
            <header className="vol-day__head">
              <h3>{dateLabel(date)}</h3>
              <button type="button" className="vol-link" onClick={() => onPickDay(date)}>
                Open in the schedule
              </button>
            </header>
            <ol className="vol-agenda">
              {items
                .filter((item) => item.date === date)
                .map((item) => {
                  const timing = timings.get(item.key);
                  return (
                    <li
                      key={item.key}
                      className={`vol-agenda__item vol-agenda__item--${item.kind === "catering" ? "crew" : item.kind}`}
                      data-state={timing}
                    >
                      <div className="vol-agenda__time">
                        {item.kind === "shift" ? (
                          <>
                            <span>
                              {formatTime(item.start)}–{formatTime(item.end)}
                            </span>
                            <small>{formatDuration(item.end - item.start)}</small>
                          </>
                        ) : item.kind === "catering" ? (
                          <>
                            <span>
                              {item.shift.from}–{item.shift.to}
                            </span>
                            <small>Catering</small>
                          </>
                        ) : item.kind === "crew" ? (
                          <>
                            <span>{crewTime(item.event)}</span>
                            <small>Crew</small>
                          </>
                        ) : (
                          <>
                            <span>
                              {item.entry.start === null
                                ? "Time tbc"
                                : BUILD_PHASES[item.entry.phase].end
                                  ? `${formatTime(item.start)}–${formatTime(item.end)}`
                                  : formatTime(item.start)}
                            </span>
                            <small>Build</small>
                          </>
                        )}
                        <StateBadge timing={timing} clock={clock} />
                      </div>
                      <div className="vol-agenda__body">
                        {item.kind === "shift" ? (
                          <>
                            {item.block.parts.length > 1 ? (
                              <ol className="vol-parts" aria-label="Tasks in this shift">
                                {item.block.parts.map((part) => (
                                  <li key={part.start}>
                                    <span className="vol-parts__time">{formatTime(part.start)}</span>
                                    <TaskTag task={part.task} />
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <TaskTag task={item.block.parts[0].task} />
                            )}
                            {item.block.program.length > 0 && (
                              <p className="vol-agenda__program">On stage: {item.block.program.join(" · ")}</p>
                            )}
                          </>
                        ) : item.kind === "catering" ? (
                          <div className="vol-crew">
                            <span className="vol-crew__title">{item.shift.station}</span>
                            <span className="vol-crew__meta">
                              <Users size={13} aria-hidden="true" />
                              Catering team · not counted
                            </span>
                          </div>
                        ) : item.kind === "crew" ? (
                          <div className="vol-crew">
                            <CrewEventLine event={item.event} person={person} />
                            {item.build && (
                              <ul className="vol-build-list" aria-label="Your teardown tasks">
                                {item.build.items.map((entryItem) => (
                                  <li key={entryItem.id}>{entryItem.name}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ) : (
                          <div className="vol-crew">
                            <span className="vol-crew__title">{BUILD_PHASES[item.entry.phase].label}</span>
                            <span className="vol-crew__meta">
                              <MapPin size={13} aria-hidden="true" />
                              Kultur &amp; Kongresshaus Aarau
                            </span>
                            <ul className="vol-build-list">
                              {item.entry.items.map((entryItem) => (
                                <li key={entryItem.id}>{entryItem.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
            </ol>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function VolunteersPage() {
  const [person, setPerson] = useState<string | null>(null);
  const [dayDate, setDayDate] = useState(DEFAULT_DAY);
  const [onlyMine, setOnlyMine] = useState(false);
  const [openTask, setOpenTask] = useState<VolunteerTask | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const clock = useVenueClock();
  const build = useCrewBuild();
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [needName, setNeedName] = useState(false);

  useEffect(() => {
    const fromUrl = volunteerFromSlug(new URLSearchParams(window.location.search).get("person"));
    setPerson(fromUrl ?? readStoredPerson());
  }, []);

  // Open the schedule on today's tab during the conference. Only the first reading decides,
  // so later ticks never undo a tab the reader picked.
  const dayPicked = useRef(false);
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("day")?.toLowerCase() ?? "";
    const date = DAY_PARAMS[raw] ?? raw;
    if (PLAN_TABS.some((tab) => tab.id === date)) {
      dayPicked.current = true;
      setDayDate(date);
    }
  }, []);

  // Names added on the page to sign up for the build: make them pickable, and restore
  // one chosen earlier once the list has loaded.
  const addedNames = build.state?.added ?? [];
  const addedKey = addedNames.join("|");
  useEffect(() => {
    if (!addedNames.length) return;
    registerAddedPeople(addedNames);
    setPerson((current) => {
      if (current) return current;
      const fromUrl = volunteerFromSlug(new URLSearchParams(window.location.search).get("person"));
      return fromUrl ?? readStoredPerson();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addedKey]);
  useEffect(() => {
    if (!clock || dayPicked.current) return;
    dayPicked.current = true;
    if (PLAN_DAYS.some((day) => day.dateTime === clock.date)) setDayDate(clock.date);
  }, [clock]);

  useEffect(() => {
    if (!openTask) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headRef.current?.contains(event.target as Node)) setOpenTask(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenTask(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openTask]);

  const choose = (next: string | null, scroll = false) => {
    setPerson(next);
    storePerson(next);
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("person", volunteerSlug(next));
    else url.searchParams.delete("person");
    window.history.replaceState(null, "", url);
    if (!next) setOnlyMine(false);
    if (next) setNeedName(false);
    if (scroll) {
      requestAnimationFrame(() =>
        document.getElementById("vol-picker")?.scrollIntoView({ behavior: "smooth", block: "start" })
      );
    }
  };
  const chooseAndScroll = (name: string) => choose(name, true);

  const needPerson = () => {
    setNeedName(true);
    const select = document.getElementById("vol-person");
    select?.scrollIntoView({ behavior: "smooth", block: "center" });
    select?.focus({ preventScroll: true });
  };

  const saveNewName = async () => {
    const typed = newName.replace(/\s+/g, " ").trim();
    if (typed.length < 2) return;
    const saved = await build.addPerson(typed);
    if (!saved) return;
    registerAddedPeople([saved]);
    setAdding(false);
    setNewName("");
    choose(saved);
  };

  const pickDay = (date: string) => {
    setDayDate(date);
    document.getElementById("vol-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const tab = PLAN_TABS.find((entry) => entry.id === dayDate) ?? PLAN_TABS[0];
  const day = PLAN_DAYS.find((entry) => entry.dateTime === tab.date) ?? PLAN_DAYS[0];
  const cateringTab = tab.catering;
  const rows = (cateringTab ? cateringPlanRows(tab.date) : planRows(day)).filter((row) => !onlyMine || !person || involves(row, person));
  const rowTimings = rows.map((row) => timingOf(clock, tab.date, row.start, row.end));
  // Between rows (or before or after them all) on the day itself, a line marks the time.
  const nowLineAt =
    clock?.date === tab.date && !rowTimings.includes("now")
      ? (() => {
          const index = rows.findIndex((row) => row.start > clock.minutes);
          return index === -1 ? rows.length : index;
        })()
      : -1;
  const nowLine = clock && (
    <li className="vol-nowline" aria-label={`Now, ${formatTime(clock.minutes)}`}>
      <span className="vol-state">Now · {formatTime(clock.minutes)}</span>
    </li>
  );

  return (
    <div className="vol-page">
      <header className="vol-head">
        <div className="vol-topbar">
          {/* The logo is also a mask, so the light theme can paint it navy. */}
          <a
            className="vol-logo"
            href={withBase("/")}
            style={{ "--vol-logo": `url("${withBase("img/logo.png")}")` } as CSSProperties}
          >
            <img src={withBase("img/logo.png")} alt="ALPS Research Conference" width="753" height="306" />
          </a>
          <ThemeSwitch />
        </div>
        <p className="section-eyebrow">ALPS Conference 2026 · Crew</p>
        <h1 className="section-title">Volunteer portal</h1>
        <p className="vol-sub">
          Shifts and crew times for ALPS Conference 2026, from loading on Thursday 8 to unloading on Sunday 11 October.
          Pick your name to see your shifts and add them to your calendar. Sign up for the setup on Thursday and the
          teardown on Saturday in those tabs.
        </p>
      </header>

      <section id="vol-picker" className="vol-picker" aria-label="Choose a person">
        <label htmlFor="vol-person" className="vol-label">
          Show shifts for
        </label>
        <div className="vol-select">
          <select
            id="vol-person"
            value={person ? volunteerSlug(person) : ""}
            onChange={(event) => {
              if (event.target.value === "__add") {
                setAdding(true);
                return;
              }
              choose(volunteerFromSlug(event.target.value));
            }}
          >
            <option value="">Everyone</option>
            <optgroup label="ALPS team members">
              {CREW_TEAM.map((name) => (
                <option key={name} value={volunteerSlug(name)}>
                  {name}
                </option>
              ))}
            </optgroup>
            <optgroup label="Volunteers">
              {CREW_VOLUNTEERS.map((name) => (
                <option key={name} value={volunteerSlug(name)}>
                  {name}
                </option>
              ))}
            </optgroup>
            {addedNames.length > 0 && (
              <optgroup label="Added for the build">
                {addedNames.map((name) => (
                  <option key={name} value={volunteerSlug(name)}>
                    {name}
                  </option>
                ))}
              </optgroup>
            )}
            <option value="__add">Not on the list? Add my name…</option>
          </select>
        </div>
        {adding && (
          <form
            className="vol-addname"
            onSubmit={(event) => {
              event.preventDefault();
              saveNewName();
            }}
          >
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Your first name"
              autoComplete="given-name"
              maxLength={40}
              autoFocus
            />
            <button type="submit">Save</button>
            <button type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </form>
        )}
        {needName && !person && <p className="vol-addname__hint">Pick your name first, then sign up.</p>}
      </section>

      {person && <MyShifts person={person} clock={clock} onPickDay={pickDay} build={personBuild(build.state, person)} />}

      <section id="vol-plan" className="vol-section" aria-labelledby="vol-plan-title">
        <div className="vol-plan__bar">
          <h2 id="vol-plan-title" className="vol-h2">
            Schedule
          </h2>
          <div className="vol-plan__controls">
            <div className="vol-tabs" role="tablist" aria-label="Day">
              {PLAN_TABS.map((entry, index) => (
                <Fragment key={entry.id}>
                  {/* On phones the catering tabs start a second row. */}
                  {entry.catering && !PLAN_TABS[index - 1]?.catering && (
                    <span className="vol-tabs__break" aria-hidden="true" />
                  )}
                  <button
                    type="button"
                    role="tab"
                    id={`vol-tab-${entry.id}`}
                    aria-selected={entry.id === tab.id}
                    aria-controls="vol-grid"
                    data-past={(clock && entry.date < clock.date) || undefined}
                    onClick={() => setDayDate(entry.id)}
                  >
                    {tabLabel(entry.date)}
                    {entry.catering && " Catering"}
                  </button>
                </Fragment>
              ))}
            </div>
            {person && (
              <label className="vol-toggle">
                <input type="checkbox" checked={onlyMine} onChange={(event) => setOnlyMine(event.target.checked)} />
                Only {person}’s slots
              </label>
            )}
          </div>
        </div>

        <div id="vol-grid" className="vol-grid" role="tabpanel" aria-labelledby={`vol-tab-${tab.id}`}>
          {!cateringTab && day.shiftDay && (
            <div ref={headRef} className="vol-grid__head">
              <span className="vol-grid__col">Time</span>
              <span className="vol-grid__col">On stage</span>
              {VOLUNTEER_TASK_ORDER.map((task) => (
                <TaskHeader
                  key={task}
                  task={task}
                  open={openTask === task}
                  onToggle={() => setOpenTask((current) => (current === task ? null : task))}
                />
              ))}
            </div>
          )}
          <ol className="vol-grid__rows">
            {rows.map((row, index) => {
              const timing = rowTimings[index];
              const hasMe = Boolean(person) && involves(row, person!);
              return (
                <Fragment key={row.key}>
                  {index === nowLineAt && nowLine}
                  {row.kind === "catering" ? (
                    <li className="vol-slot vol-slot--crew" data-me={hasMe || undefined} data-state={timing}>
                      <div className="vol-slot__time">
                        {row.row.from}–{row.row.to}
                        <StateBadge timing={timing} clock={clock} />
                      </div>
                      <div className="vol-slot__program">
                        <strong>{row.row.station}</strong>
                        <span className="vol-slot__place">Catering</span>
                      </div>
                      <div className="vol-slot__crew">
                        {row.row.people.map((name) => (
                          <NamePill key={name} name={name} person={person} onChoose={chooseAndScroll} />
                        ))}
                      </div>
                    </li>
                  ) : row.kind === "crew" ? (
                    <li className="vol-slot vol-slot--crew" data-me={hasMe || undefined} data-state={timing}>
                      <div className="vol-slot__time">
                        {crewTime(row.event)}
                        <StateBadge timing={timing} clock={clock} />
                      </div>
                      <div className="vol-slot__program">
                        <strong>{row.event.title}</strong>
                        <span className="vol-slot__place">{row.event.place}</span>
                      </div>
                      <div className="vol-slot__crew">
                        {row.event.people ? (
                          row.event.people.map((name) => (
                            <NamePill key={name} name={name} person={person} onChoose={chooseAndScroll} />
                          ))
                        ) : (
                          <span className="vol-slot__everyone">Everyone</span>
                        )}
                      </div>
                    </li>
                  ) : (
                    <li className="vol-slot" data-me={hasMe || undefined} data-state={timing}>
                      <div className="vol-slot__time">
                        {row.slot.from}–{row.slot.to}
                        <StateBadge timing={timing} clock={clock} />
                      </div>
                      <div className="vol-slot__program">
                        {row.slot.program ? <strong>{row.slot.program}</strong> : <span>{row.program}</span>}
                      </div>
                      {VOLUNTEER_TASK_ORDER.map((task) => (
                        <div
                          key={task}
                          className="vol-slot__cell"
                          data-task={task}
                          data-empty={!row.slot[task].length || undefined}
                        >
                          <span className="vol-slot__label">{VOLUNTEER_TASKS[task].label}</span>
                          <span className="vol-slot__names">
                            {row.slot[task].length ? (
                              row.slot[task].map((name) => (
                                <NamePill key={name} name={name} person={person} onChoose={chooseAndScroll} />
                              ))
                            ) : (
                              <span className="vol-slot__none">–</span>
                            )}
                          </span>
                        </div>
                      ))}
                    </li>
                  )}
                </Fragment>
              );
            })}
            {nowLineAt === rows.length && nowLine}
          </ol>
        </div>
        {cateringTab && (
          <p className="vol-note">Catering team (Volunteer A–J), from the catering plan. Not counted in the hours.</p>
        )}
        {!cateringTab && BUILD_DAYS[day.dateTime] && (
          <CrewBuild
            dateTime={day.dateTime}
            person={person}
            build={build}
            onlyMine={onlyMine}
            onNeedPerson={needPerson}
          />
        )}
      </section>

      <footer className="vol-foot">
        <p>
          <Info size={15} aria-hidden="true" />
          <span>
            Changes? Tell {CREW_CONTACTS.changes}. Not sure on the day? Ask a Happy Helper,{" "}
            {CREW_CONTACTS.onSite.join(" or ")}.
          </span>
        </p>
        <p className="vol-note">Counted hours: {COUNTING_RULE}</p>
      </footer>
    </div>
  );
}
