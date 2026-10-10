import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { ChevronDown, CircleHelp, Info, MapPin, Moon, Sun, SunMoon, Users, type LucideIcon } from "lucide-react";
import CalendarSubscribe from "./CalendarSubscribe";
import CrewBuild from "./CrewBuild";
import CrewLinks from "./CrewLinks";
import LinkButton, { pageLink, useCopyLink } from "./LinkButton";
import { CREW_EVENT_LINKS, DAY_LINKS, TASK_LINKS } from "../data/crewLinks";
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
  cateringDuring,
  cateringEnd,
  cateringFor,
  cateringLabel,
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
  type CateringCell,
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
  // Catering used to have its own tabs; it is now a column of that day's grid.
  "fri-catering": "2026-10-09",
  "sat-catering": "2026-10-10",
};
/** `?slot=14:00` or `?event=<id>`: a link to one row of that day's grid, copied from its "Link" button. */
const SLOT_PARAM = "slot";
const EVENT_PARAM = "event";

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
  | { kind: "slot"; key: string; start: number; end: number; slot: ShiftSlot; program: string; catering: CateringCell[] }
  | { kind: "crew"; key: string; start: number; end: number; event: CrewEvent };

const EMPTY_SLOT = { checkin: [], info: [], mic: [], helper: [] } as const;

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

/** From the teardown circle on Saturday at 21:00 the shift grid folds away, so the teardown shows first. */
const GRID_FOLD = { date: "2026-10-10", minutes: 21 * 60 };

function gridFoldedFor(date: string, clock: Clock | null) {
  if (!clock || date !== GRID_FOLD.date) return false;
  return clock.date > GRID_FOLD.date || (clock.date === GRID_FOLD.date && clock.minutes >= GRID_FOLD.minutes);
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
    catering: cateringDuring(day.dateTime, toMinutes(slot.from), toMinutes(slot.to)),
  }));
  // Catering that runs past the last grid slot (the Saturday teardown) gets half-hour rows of its own.
  const last = slots.at(-1);
  const until = cateringEnd(day.dateTime);
  if (last && until) {
    for (let start = last.end; start < until; start += 30) {
      const end = Math.min(start + 30, until);
      slots.push({
        kind: "slot",
        key: formatTime(start),
        start,
        end,
        slot: { from: formatTime(start), to: formatTime(end), ...EMPTY_SLOT },
        program: "",
        catering: cateringDuring(day.dateTime, start, end),
      });
    }
  }
  return [...crew, ...slots].sort((a, b) => a.start - b.start);
}

function involves(row: PlanRow, person: string) {
  return row.kind === "crew"
    ? !row.event.people || row.event.people.includes(person)
    : VOLUNTEER_TASK_ORDER.some((task) => row.slot[task].includes(person)) ||
        row.catering.some((cell) => cell.people.some((entry) => entry.name === person));
}

/** One row across days: its element id (`vol-row-…`), the key the "Copied" state uses, its link and its name. */
const rowId = (date: string, row: PlanRow) => `${date}-${row.kind}-${row.key}`;
const rowAnchor = (date: string, row: PlanRow) => `vol-row-${rowId(date, row)}`;
const rowLink = (date: string, row: PlanRow) =>
  pageLink(date, row.kind === "slot" ? { [SLOT_PARAM]: row.key } : { [EVENT_PARAM]: row.key });
const rowLabel = (date: string, row: PlanRow) =>
  row.kind === "slot" ? `the ${row.slot.from}–${row.slot.to} row on ${tabLabel(date)}` : `${row.event.title} on ${tabLabel(date)}`;

/** "from 16:15", "to 20:45" or "20:15–20:45" when a catering shift starts or ends inside the row; nothing when it spans it. */
function cateringEdge(entry: { from?: number; to?: number }) {
  if (entry.from !== undefined && entry.to !== undefined) return `${formatTime(entry.from)}–${formatTime(entry.to)}`;
  if (entry.from !== undefined) return `from ${formatTime(entry.from)}`;
  if (entry.to !== undefined) return `to ${formatTime(entry.to)}`;
  return null;
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
          <CrewLinks links={TASK_LINKS[task]} label={`Links for ${info.label}`} className="vol-links--popover" />
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

/** The catering column's head: same help popover as the task heads, with the plan's own wording. */
function CateringHeader({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  const id = "vol-task-help-catering";
  const popoverRef = useRef<HTMLDivElement>(null);
  useKeepInViewport(popoverRef, open);
  return (
    <div className="vol-taskhead" data-task="catering">
      <button type="button" className="vol-taskhead__button" aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className="vol-taskhead__label">
          <span className="vol-taskhead__last">
            Catering
            <CircleHelp size={14} aria-hidden="true" />
          </span>
        </span>
        <span className="sr-only">: what this is</span>
      </button>
      {open && (
        <div ref={popoverRef} id={id} className="vol-popover" role="dialog" aria-label="Catering team">
          <p className="vol-popover__title">Catering team</p>
          <p>Kitchen, service and apéro shifts from the catering plan. “from” and “to” mark a shift that starts or ends inside the row.</p>
          <p className="vol-popover__note">Not counted in the hours.</p>
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
  linked,
  copied,
  onChoose,
  onCopy,
}: {
  rows: PlanRow[];
  date: string;
  clock: Clock | null;
  person: string | null;
  /** The row a copied link points at, and the row whose link was just copied, as `rowId`s. */
  linked: string | null;
  copied: string | null;
  onChoose: (name: string) => void;
  onCopy: (row: PlanRow) => void;
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
        const id = rowId(date, row);
        const link = (
          <span className="vol-slot__link">
            <LinkButton copied={copied === id} label={rowLabel(date, row)} onCopy={() => onCopy(row)} />
          </span>
        );
        return (
          <Fragment key={row.key}>
            {index === nowLineAt && nowLine}
            {row.kind === "crew" ? (
              <li
                id={rowAnchor(date, row)}
                className="vol-slot vol-slot--crew"
                data-me={hasMe || undefined}
                data-state={timing}
                data-linked={linked === id || undefined}
              >
                <div className="vol-slot__time">
                  {crewTime(row.event)}
                  <StateBadge timing={timing} clock={clock} />
                  {link}
                </div>
                <div className="vol-slot__program">
                  <strong>{row.event.title}</strong>
                  <span className="vol-slot__place">{row.event.place}</span>
                  <CrewLinks links={CREW_EVENT_LINKS[row.event.id]} label={`Links for ${row.event.title}`} className="vol-links--slot" />
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
              <li
                id={rowAnchor(date, row)}
                className="vol-slot"
                data-me={hasMe || undefined}
                data-state={timing}
                data-linked={linked === id || undefined}
              >
                <div className="vol-slot__time">
                  {row.slot.from}–{row.slot.to}
                  <StateBadge timing={timing} clock={clock} />
                  {link}
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
                <div className="vol-slot__cell" data-task="catering" data-empty={!row.catering.length || undefined}>
                  <span className="vol-slot__label">Catering</span>
                  <span className="vol-slot__names vol-slot__catering">
                    {row.catering.length ? (
                      row.catering.map((cell) => {
                        // One edge for the whole station when everyone shares it, otherwise per person.
                        const [first] = cell.people;
                        const shared = cell.people.every((entry) => entry.from === first.from && entry.to === first.to);
                        return (
                          <span key={cell.station} className="vol-catgroup">
                            <span className="vol-catgroup__label">
                              {cell.label}
                              {shared && <small className="vol-catgroup__edge">{cateringEdge(first)}</small>}
                            </span>
                            {cell.people.map((entry) => (
                              <span key={entry.name} className="vol-catgroup__person">
                                <NamePill name={entry.name} person={person} onChoose={onChoose} />
                                {!shared && <small className="vol-catgroup__edge">{cateringEdge(entry)}</small>}
                              </span>
                            ))}
                          </span>
                        );
                      })
                    ) : (
                      <span className="vol-slot__none">–</span>
                    )}
                  </span>
                </div>
              </li>
            )}
          </Fragment>
        );
      })}
      {nowLineAt === rows.length && nowLine}
    </ol>
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
  // During the conference the list opens on today: days already over fold away at the end,
  // unless nothing is left ahead (after the conference everything shows again).
  const [pastOpen, setPastOpen] = useState(false);
  const pastCandidates = clock ? dates.filter((date) => date < clock.date) : [];
  const pastDates = pastCandidates.length < dates.length ? pastCandidates : [];
  const shownDates = dates.filter((date) => !pastDates.includes(date));
  const pastCount = items.filter((item) => pastDates.includes(item.date)).length;

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
        {shownDates.map(renderDay)}
        {pastDates.length > 0 && (
          <article className="vol-day vol-day--past" data-open={pastOpen || undefined}>
            <h3 className="vol-day__fold">
              <button type="button" aria-expanded={pastOpen} aria-controls="vol-mine-past" onClick={() => setPastOpen((open) => !open)}>
                <span>
                  Earlier · {pastDates.map((date) => tabLabel(date)).join(", ")}
                  <small>
                    {pastCount} item{pastCount === 1 ? "" : "s"} already behind you
                  </small>
                </span>
                <ChevronDown size={18} aria-hidden="true" className="vol-day__chevron" />
              </button>
            </h3>
            {pastOpen && (
              <div id="vol-mine-past" className="vol-day__past">
                {pastDates.map(renderDay)}
              </div>
            )}
          </article>
        )}
      </div>
    </section>
  );

  function renderDay(date: string) {
    return (
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
                                  <li key={entryItem.id}>
                                    {entryItem.was && (
                                      <>
                                        <s className="cb-was">{entryItem.was}</s>{" "}
                                      </>
                                    )}
                                    {entryItem.name}
                                  </li>
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
                                <li key={entryItem.id}>
                                  {entryItem.was && (
                                    <>
                                      <s className="cb-was">{entryItem.was}</s>{" "}
                                    </>
                                  )}
                                  {entryItem.name}
                                </li>
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
    );
  }
}

export default function VolunteersPage() {
  const [person, setPerson] = useState<string | null>(null);
  const [dayDate, setDayDate] = useState(DEFAULT_DAY);
  const [onlyMine, setOnlyMine] = useState(false);
  const [openTask, setOpenTask] = useState<VolunteerTask | "catering" | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  /** The row a copied link points at, and the row whose link was just copied. */
  const [linked, setLinked] = useState<string | null>(null);
  const [gridOpen, setGridOpen] = useState(false);
  const { copied, copy } = useCopyLink();
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
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("day")?.toLowerCase() ?? "";
    const date = DAY_PARAMS[raw] ?? raw;
    if (PLAN_DAYS.some((day) => day.dateTime === date)) {
      dayPicked.current = true;
      setDayDate(date);
      // A link to one row of that day, from its "Link" button.
      const slot = params.get(SLOT_PARAM);
      const event = params.get(EVENT_PARAM);
      if (slot) setLinked(`${date}-slot-${slot}`);
      else if (event) setLinked(`${date}-crew-${event}`);
      // A shared row opens the grid even when it is folded.
      if (slot || event) setGridOpen(true);
    }
  }, []);

  // Bring the linked row into view: once the rows are on the page, and again when the sign-ups load and the page grows.
  const hasBuild = Boolean(build.state);
  useEffect(() => {
    if (!linked) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`vol-row-${linked}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [linked, hasBuild]);

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

  /** Switching days also drops the highlight a copied link opened with. */
  const showDay = (date: string) => {
    setDayDate(date);
    setLinked(null);
  };
  const pickDay = (date: string) => {
    showDay(date);
    document.getElementById("vol-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const day = PLAN_DAYS.find((entry) => entry.dateTime === dayDate) ?? PLAN_DAYS[0];
  const copyRow = (row: PlanRow) => copy(rowId(day.dateTime, row), rowLink(day.dateTime, row));
  const mine = (row: PlanRow) => !onlyMine || !person || involves(row, person);
  const rows = planRows(day).filter(mine);

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
        <p className="vol-notice">
          <Info size={15} aria-hidden="true" />
          <span>The plan may still change, and we can’t accommodate wishes. Thanks for your understanding.</span>
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
        {person && (
          <label className="vol-toggle vol-picker__toggle">
            <input type="checkbox" checked={onlyMine} onChange={(event) => setOnlyMine(event.target.checked)} />
            Only {person}’s slots
          </label>
        )}
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
                  onClick={() => showDay(entry.dateTime)}
                >
                  {tabLabel(entry.dateTime)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div id="vol-day-panel" role="tabpanel" aria-labelledby={`vol-tab-${day.dateTime}`}>
          {DAY_LINKS[day.dateTime] && (
            <div className="vol-daylinks">
              <p className="vol-daylinks__title">Links for {tabLabel(day.dateTime)}</p>
              <CrewLinks links={DAY_LINKS[day.dateTime]} label={`Links for ${tabLabel(day.dateTime)}`} />
            </div>
          )}
          {gridFoldedFor(day.dateTime, clock) && (
            <h3 className="vol-gridfold" data-open={gridOpen || undefined}>
              <button type="button" aria-expanded={gridOpen} aria-controls="vol-grid" onClick={() => setGridOpen((open) => !open)}>
                <span>
                  Shift schedule
                  <small>{gridOpen ? "Tap to fold it away again" : "Folded during the teardown · tap to open"}</small>
                </span>
                <ChevronDown size={18} aria-hidden="true" className="vol-day__chevron" />
              </button>
            </h3>
          )}
          <div id="vol-grid" className="vol-grid" hidden={(gridFoldedFor(day.dateTime, clock) && !gridOpen) || undefined}>
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
                <CateringHeader
                  open={openTask === "catering"}
                  onToggle={() => setOpenTask((current) => (current === "catering" ? null : "catering"))}
                />
              </div>
            )}
            <PlanList
              rows={rows}
              date={day.dateTime}
              clock={clock}
              person={person}
              linked={linked}
              copied={copied}
              onChoose={chooseAndScroll}
              onCopy={copyRow}
            />
          </div>
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
            Can’t make a shift? Tell {CREW_CONTACTS.changes}. Not sure on the day? Ask a Happy Helper,{" "}
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
