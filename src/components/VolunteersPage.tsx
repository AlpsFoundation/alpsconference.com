import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, CircleHelp, Info, MapPin, Moon, Sun, SunMoon, Users, type LucideIcon } from "lucide-react";
import CalendarSubscribe from "./CalendarSubscribe";
import CrewBuild from "./CrewBuild";
import { useCrewBuild } from "./useCrewBuild";
import { BUILD_PHASES } from "../data/crewBuild";
import { BUILD_DAYS, personBuild, type PersonBuildEntry } from "../lib/crewBuild";
import { parseTimeTravel } from "../data/conferenceTimeline";
import {
  COUNTING_RULE,
  CREW_CONTACTS,
  CREW_ROLES,
  VOLUNTEER_TASK_ORDER,
  VOLUNTEER_TASKS,
  type CateringShift,
  type CrewEvent,
  type ShiftSlot,
  type VolunteerTask,
} from "../data/volunteers";
import {
  blockMinutes,
  cateringFor,
  cateringLabel,
  cateringServices,
  countedMinutes,
  CREW_TEAM,
  CREW_VOLUNTEERS,
  crewEventEnd,
  crewEventsFor,
  formatDuration,
  formatTime,
  PLAN_DAYS,
  registerAddedPeople,
  rolesFor,
  shiftBlocks,
  slotPrograms,
  teamPhoto,
  toMinutes,
  volunteerCalendarPath,
  volunteerFromSlug,
  volunteerSlug,
  type CateringBar,
  type CateringService,
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
  // Catering used to have its own tabs; it now sits under that day's grid.
  "fri-catering": "2026-10-09",
  "sat-catering": "2026-10-10",
};

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
  | { kind: "crew"; key: string; start: number; end: number; event: CrewEvent };

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

function involves(row: PlanRow, person: string) {
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

/** One timeline of schedule rows, with a line marking the time between rows on the day itself. */
function PlanList({
  rows,
  date,
  clock,
  person,
  onChoose,
}: {
  rows: PlanRow[];
  date: string;
  clock: Clock | null;
  person: string | null;
  onChoose: (name: string) => void;
}) {
  const rowTimings = rows.map((row) => timingOf(clock, date, row.start, row.end));
  const nowLineAt =
    clock?.date === date && !rowTimings.includes("now")
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
    <ol className="vol-grid__rows">
      {rows.map((row, index) => {
        const timing = rowTimings[index];
        const hasMe = Boolean(person) && involves(row, person!);
        return (
          <Fragment key={row.key}>
            {index === nowLineAt && nowLine}
            {row.kind === "crew" ? (
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
                      <NamePill key={name} name={name} person={person} onChoose={onChoose} />
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
                          <NamePill key={name} name={name} person={person} onChoose={onChoose} />
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
  );
}

/** Hour marks on a service's timeline: every half hour for short services, every hour for long ones. */
function timelineTicks(start: number, end: number) {
  const step = end - start > 180 ? 60 : 30;
  const ticks: number[] = [];
  for (let t = Math.ceil(start / step) * step; t <= end; t += step) ticks.push(t);
  return ticks;
}

/** Every half hour within a service, for the vertical timeline's axis. */
function halfHours(start: number, end: number) {
  const marks: number[] = [];
  for (let t = Math.ceil(start / 30) * 30; t <= end; t += 30) marks.push(t);
  return marks;
}

/** Overlapping shift times at one station sit side by side: each takes the first lane free at its start. */
function laneBars(bars: CateringBar[]) {
  const ends: number[] = [];
  const placed = bars.map((bar) => {
    let lane = ends.findIndex((end) => end <= bar.from);
    if (lane === -1) lane = ends.length;
    ends[lane] = bar.to;
    return { bar, lane };
  });
  return { placed, lanes: ends.length };
}

/**
 * Rem per minute on a day's vertical timelines: enough for the tightest shift to show its
 * time and one name per line in a narrow column. One scale per day, so services compare.
 */
function verticalScale(services: CateringService[]) {
  const bars = services.flatMap((service) => service.stations.flatMap((station) => station.bars));
  return Math.max(0.1, ...bars.map((bar) => (2 + bar.people.length * 1.8) / (bar.to - bar.from)));
}

/** The catering plan runs vertically; the horizontal bars stay in CateringCard, unused for now. */
type CateringView = "vertical" | "horizontal";
const CATERING_VIEW: CateringView = "vertical";

/** One service (lunch, dinner…) as a small calendar: each station once, its shift times as bars on the service's timeline. */
function CateringCard({
  service,
  date,
  clock,
  person,
  onlyMine,
  view,
  onChoose,
}: {
  service: CateringService;
  date: string;
  clock: Clock | null;
  person: string | null;
  onlyMine: boolean;
  view: CateringView;
  onChoose: (name: string) => void;
}) {
  const span = service.end - service.start;
  const at = (minutes: number) => `${((minutes - service.start) / span) * 100}%`;
  const single = service.stations.length === 1 && service.stations[0].label === service.label;
  const live = clock?.date === date && clock.minutes >= service.start && clock.minutes < service.end;
  const stations = service.stations
    .map((station) => ({ ...station, bars: station.bars.filter((bar) => !onlyMine || !person || bar.people.includes(person)) }))
    .filter((station) => station.bars.length);
  const ticks = timelineTicks(service.start, service.end);
  const pills = (people: string[]) => people.map((name) => <NamePill key={name} name={name} person={person} onChoose={onChoose} />);

  // One station, one shift time: a timeline would only repeat the header, so it is one line.
  if (single && service.stations[0].bars.length === 1) {
    const [bar] = service.stations[0].bars;
    return (
      <article
        id={`vol-cater-${service.id}`}
        className="vol-cater vol-cater--simple"
        data-live={live || undefined}
        data-me={(person && bar.people.includes(person)) || undefined}
        data-state={timingOf(clock, date, bar.from, bar.to)}
        aria-labelledby={`vol-cater-${service.id}-title`}
      >
        <header className="vol-cater__head">
          <h4 id={`vol-cater-${service.id}-title`}>{service.label}</h4>
          <span className="vol-cater__window">
            {formatTime(bar.from)}–{formatTime(bar.to)}
          </span>
          {live && clock && <span className="vol-state">Now · {formatTime(clock.minutes)}</span>}
          <span className="vol-cater__names">{pills(bar.people)}</span>
        </header>
      </article>
    );
  }

  const head = (
    <header className="vol-cater__head">
      <h4 id={`vol-cater-${service.id}-title`}>{service.label}</h4>
      <span className="vol-cater__window">
        {formatTime(service.start)}–{formatTime(service.end)}
      </span>
      <span className="vol-cater__count">{service.people.length} people</span>
      {live && clock && <span className="vol-state">Now · {formatTime(clock.minutes)}</span>}
    </header>
  );

  // Vertical: time runs down the left, each station is a column, and each shift time a block
  // as tall as it lasts, with its names inside.
  if (view === "vertical") {
    const groups = stations.map((station) => ({ station, ...laneBars(station.bars) }));
    const offsets = groups.map((_, index) => groups.slice(0, index).reduce((sum, group) => sum + group.lanes, 0));
    const lanes = groups.reduce((sum, group) => sum + group.lanes, 0);
    const from = (minutes: number) => ({ "--at": minutes - service.start }) as CSSProperties;
    const marks = halfHours(service.start, service.end);
    return (
      <article
        id={`vol-cater-${service.id}`}
        className="vol-cater vol-cater--vertical"
        data-live={live || undefined}
        data-me={(person && service.people.includes(person)) || undefined}
        aria-labelledby={`vol-cater-${service.id}-title`}
      >
        {head}
        <div className="vol-cal">
          <div className="vol-cal__grid" style={{ "--lanes": lanes, "--span": span } as CSSProperties}>
            {!single && (
              <div className="vol-cal__heads">
                {groups.map((group) => (
                  <span key={group.station.station} className="vol-cal__head" style={{ gridColumn: `span ${group.lanes}` }}>
                    {group.station.label}
                  </span>
                ))}
              </div>
            )}
            <div className="vol-cal__axis" aria-hidden="true">
              {marks.map((mark) => (
                <span key={mark} data-hour={mark % 60 === 0 || undefined} style={from(mark)}>
                  {formatTime(mark)}
                </span>
              ))}
            </div>
            <div className="vol-cal__body">
              {marks.map((mark) => (
                <span key={mark} className="vol-cal__line" data-hour={mark % 60 === 0 || undefined} style={from(mark)} />
              ))}
              {offsets.slice(1).map((offset) => (
                <span key={offset} className="vol-cal__sep" style={{ gridColumn: `${offset + 1} / span 1` }} />
              ))}
              {groups.flatMap((group, index) =>
                group.placed.map(({ bar, lane }) => (
                  <div
                    key={`${group.station.station}-${bar.from}-${bar.to}`}
                    className="vol-cal__block"
                    data-me={(person && bar.people.includes(person)) || undefined}
                    data-state={timingOf(clock, date, bar.from, bar.to)}
                    style={{
                      ...from(bar.from),
                      "--len": bar.to - bar.from,
                      // An absolutely placed grid item needs both lines, or it runs to the edge.
                      gridColumn: `${offsets[index] + lane + 1} / span 1`,
                    } as CSSProperties}
                  >
                    <span className="vol-cal__time">
                      {!single && <span className="sr-only">{group.station.label}, </span>}
                      {formatTime(bar.from)}–{formatTime(bar.to)}
                    </span>
                    <span className="vol-cal__names">{pills(bar.people)}</span>
                  </div>
                )),
              )}
              {live && clock && <span className="vol-cal__now" style={from(clock.minutes)} />}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      id={`vol-cater-${service.id}`}
      className="vol-cater"
      data-single={single || undefined}
      data-live={live || undefined}
      data-me={(person && service.people.includes(person)) || undefined}
      aria-labelledby={`vol-cater-${service.id}-title`}
    >
      {head}
      <div className="vol-cater__ruler" aria-hidden="true">
        <span className="vol-cater__track">
          {ticks.map((tick) => (
            <span key={tick} className="vol-cater__tick" data-hour={tick % 60 === 0 || undefined} style={{ left: at(tick) }}>
              {tick % 60 === 0 && tick !== service.end && <span>{formatTime(tick)}</span>}
            </span>
          ))}
        </span>
      </div>
      <ol className="vol-cater__rows">
        {stations.flatMap((station) =>
          station.bars.map((bar, index) => {
            const hasMe = Boolean(person) && bar.people.includes(person!);
            return (
              <li
                key={`${station.station}-${bar.from}-${bar.to}`}
                className="vol-cater__row"
                data-first={index === 0 || undefined}
                data-me={hasMe || undefined}
                data-state={timingOf(clock, date, bar.from, bar.to)}
              >
                {!single && <span className="vol-cater__station">{index === 0 ? station.label : ""}</span>}
                <span className="vol-cater__time">
                  {formatTime(bar.from)}–{formatTime(bar.to)}
                </span>
                <span className="vol-cater__track" aria-hidden="true">
                  {ticks.map((tick) => (
                    <span key={tick} className="vol-cater__grid" style={{ left: at(tick) }} />
                  ))}
                  <span className="vol-cater__bar" style={{ left: at(bar.from), width: `${((bar.to - bar.from) / span) * 100}%` }} />
                  {live && clock && <span className="vol-cater__now" style={{ left: at(clock.minutes) }} />}
                </span>
                <span className="vol-cater__names">{pills(bar.people)}</span>
              </li>
            );
          }),
        )}
      </ol>
    </article>
  );
}

/**
 * The catering team's day, folded into one line per service until opened. It opens
 * by itself only for someone with catering shifts on that day.
 */
function CateringPlan({
  date,
  clock,
  person,
  onlyMine,
  open,
  onToggle,
  onOpenService,
  onChoose,
}: {
  date: string;
  clock: Clock | null;
  person: string | null;
  onlyMine: boolean;
  open: boolean;
  onToggle: () => void;
  onOpenService: (id: string) => void;
  onChoose: (name: string) => void;
}) {
  const all = useMemo(() => cateringServices(date), [date]);
  const services = onlyMine && person ? all.filter((service) => service.people.includes(person)) : all;
  if (!services.length) return null;
  const people = new Set(all.flatMap((service) => service.people)).size;
  const mine = person
    ? all.flatMap((service) =>
        service.stations.flatMap((station) =>
          station.bars
            .filter((bar) => bar.people.includes(person))
            .map((bar) => ({ key: `${station.station}-${bar.from}`, label: cateringLabel(station.station), bar })),
        ),
      )
    : [];

  return (
    <section id="vol-catering" className="vol-catering" data-open={open || undefined} aria-labelledby="vol-catering-title">
      <h3 id="vol-catering-title" className="vol-catering__head">
        <button type="button" aria-expanded={open} aria-controls="vol-catering-body" onClick={onToggle}>
          <span className="vol-catering__title">Catering team</span>
          <span className="vol-catering__meta">
            {all.length} services · {people} people · not counted in the hours
          </span>
          <ChevronDown size={18} aria-hidden="true" className="vol-catering__chevron" />
        </button>
      </h3>
      {mine.length > 0 && (
        <p className="vol-catering__mine">
          <strong>{person}</strong>
          {mine.map((entry) => (
            <span key={entry.key} className="vol-catering__shift">
              <b>
                {formatTime(entry.bar.from)}–{formatTime(entry.bar.to)}
              </b>{" "}
              {entry.label}
            </span>
          ))}
        </p>
      )}
      {open ? (
        <div
          id="vol-catering-body"
          className="vol-catering__services"
          style={{ "--vol-cal-min": `${verticalScale(all)}rem` } as CSSProperties}
        >
          {services.map((service) => (
            <CateringCard
              key={service.id}
              service={service}
              date={date}
              clock={clock}
              person={person}
              onlyMine={onlyMine}
              view={CATERING_VIEW}
              onChoose={onChoose}
            />
          ))}
        </div>
      ) : (
        <ol className="vol-catering__strip" aria-label="Services">
          {services.map((service) => (
            <li key={service.id}>
              <button
                type="button"
                data-me={(person && service.people.includes(person)) || undefined}
                data-state={timingOf(clock, date, service.start, service.end)}
                onClick={() => onOpenService(service.id)}
              >
                <span>{service.label}</span>
                <small>
                  {formatTime(service.start)}–{formatTime(service.end)}
                </small>
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
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
  const roles = rolesFor(person);
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
            {roles.length > 0 && (
              <p className="vol-mine__stats">
                Role, Fri &amp; Sat: <strong>{roles.join(" · ")}</strong> · not counted
              </p>
            )}
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
                            <span className="vol-crew__title">{cateringLabel(item.shift.station)}</span>
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
  // The catering plan opens by itself for someone with catering that day; a click decides for that person and day.
  const [cateringChoice, setCateringChoice] = useState<{ key: string; open: boolean } | null>(null);
  const [cateringLinked, setCateringLinked] = useState(false);
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
    if (PLAN_DAYS.some((day) => day.dateTime === date)) {
      dayPicked.current = true;
      setDayDate(date);
    }
    // Links to the old catering tabs open the catering plan.
    if (raw.endsWith("-catering")) {
      setCateringLinked(true);
      window.setTimeout(() => document.getElementById("vol-catering")?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
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

  const day = PLAN_DAYS.find((entry) => entry.dateTime === dayDate) ?? PLAN_DAYS[0];
  const mine = (row: PlanRow) => !onlyMine || !person || involves(row, person);
  const rows = planRows(day).filter(mine);
  const cateringKey = `${person ?? ""}|${day.dateTime}`;
  const cateringOpen =
    cateringChoice?.key === cateringKey
      ? cateringChoice.open
      : cateringLinked || (Boolean(person) && cateringFor(person!).some((shift) => shift.dateTime === day.dateTime));
  const openCateringService = (id: string) => {
    setCateringChoice({ key: cateringKey, open: true });
    requestAnimationFrame(() => document.getElementById(`vol-cater-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

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
            {/* Added names live in the build database: paused while it is unreachable. */}
            <option value="__add" disabled={build.status === "offline"}>
              {build.status === "offline" ? "Adding a name is paused (no connection)" : "Not on the list? Add my name…"}
            </option>
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
            <button type="submit" disabled={build.status === "offline"}>
              Save
            </button>
            <button type="button" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </form>
        )}
        {adding && build.error && <p className="vol-addname__hint">{build.error}</p>}
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
              {PLAN_DAYS.map((entry) => (
                <button
                  key={entry.dateTime}
                  type="button"
                  role="tab"
                  id={`vol-tab-${entry.dateTime}`}
                  aria-selected={entry.dateTime === day.dateTime}
                  aria-controls="vol-day-panel"
                  data-past={(clock && entry.dateTime < clock.date) || undefined}
                  onClick={() => setDayDate(entry.dateTime)}
                >
                  {tabLabel(entry.dateTime)}
                </button>
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

        <div id="vol-day-panel" role="tabpanel" aria-labelledby={`vol-tab-${day.dateTime}`}>
          <div className="vol-grid">
            {day.shiftDay && (
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
            <PlanList rows={rows} date={day.dateTime} clock={clock} person={person} onChoose={chooseAndScroll} />
          </div>
          <CateringPlan
            date={day.dateTime}
            clock={clock}
            person={person}
            onlyMine={onlyMine}
            open={cateringOpen}
            onToggle={() => setCateringChoice({ key: cateringKey, open: !cateringOpen })}
            onOpenService={openCateringService}
            onChoose={chooseAndScroll}
          />
          {BUILD_DAYS[day.dateTime] && (
            <CrewBuild
              dateTime={day.dateTime}
              person={person}
              build={build}
              onlyMine={onlyMine}
              onNeedPerson={needPerson}
            />
          )}
        </div>
      </section>

      <footer className="vol-foot">
        <p>
          <Info size={15} aria-hidden="true" />
          <span>
            Changes? Tell {CREW_CONTACTS.changes}. Not sure on the day? Ask a Happy Helper,{" "}
            {CREW_CONTACTS.onSite.join(" or ")}.
          </span>
        </p>
        <p className="vol-note">
          Roles (Fri &amp; Sat): {CREW_ROLES.map((role) => `${role.role} – ${role.people.join(" & ")}`).join(" · ")}.
        </p>
        <p className="vol-note">Counted hours: {COUNTING_RULE}</p>
      </footer>
    </div>
  );
}
