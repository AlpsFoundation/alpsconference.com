import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronUp, HandHeart, Maximize2, MapPin, Minimize2, Plus, Users, X } from "lucide-react";
import { BUILD_PHASES, BUILD_ZONES, type BuildItem, type BuildPhase, type BuildSection } from "../data/crewBuild";
import {
  assigneesOf,
  BUILD_DAYS,
  materialSections,
  neededFor,
  taskSections,
  tickOf,
  zoneGroupKey,
  zoneOf,
} from "../lib/crewBuild";
import { withBase } from "../lib/withBase";
import type { CrewBuildApi } from "./useCrewBuild";
import "../styles/crewBuild.css";

const MAP_KEY = "alps-volunteer-build-map";
type MapSize = "fit" | "large" | "hidden";

/** Which tasks to list: those that still need people, those not ticked yet, or all. */
const SHOW_KEY = "alps-volunteer-build-show";
type Show = "needs" | "open" | "all";
const SHOWS: { id: Show; label: string }[] = [
  { id: "needs", label: "Needs people" },
  { id: "open", label: "Not done yet" },
  { id: "all", label: "All" },
];

/** `?show=needs|open|all` wins, so a link can open straight on the tasks that need help. */
function readShow(): Show {
  const fromUrl = new URLSearchParams(window.location.search).get("show");
  if (fromUrl === "needs" || fromUrl === "open" || fromUrl === "all") return fromUrl;
  try {
    const stored = localStorage.getItem(SHOW_KEY);
    return stored === "needs" || stored === "open" ? stored : "all";
  } catch {
    return "all";
  }
}
/** The part of public/img/venue-plan.svg that holds the ground floor. */
const VIEW = { x: 84, y: 134, w: 1052, h: 432 };

type Props = {
  dateTime: string;
  person: string | null;
  build: CrewBuildApi;
  onlyMine: boolean;
  /** Called when someone tries to sign up before picking a name. */
  onNeedPerson: () => void;
};

const shortZone = (n: string) => {
  const parts = n.split(" ");
  return parts.length > 1 ? parts[0] + parts[1][0] : n;
};

function phaseTime(phase: BuildPhase) {
  const info = BUILD_PHASES[phase];
  if (!info.start) return "Time to be confirmed";
  if (info.end) return `${info.start}–${info.end}`;
  return phase === "teardown" ? `From ${info.start}` : info.start;
}

/** Tasks are "done"; "Arrived" and "On the truck" belong to the material checklist. */
function taskDoneLabel(phase: BuildPhase) {
  return phase === "unload" || phase === "load" ? "Done" : BUILD_PHASES[phase].doneLabel;
}

function readMapSize(): MapSize {
  try {
    const value = localStorage.getItem(MAP_KEY);
    return value === "large" || value === "hidden" ? value : "fit";
  } catch {
    return "fit";
  }
}

function ZoneChip({ n, selected, onPick }: { n: string; selected: boolean; onPick: (n: string) => void }) {
  const zone = zoneOf(n);
  return (
    <button type="button" className="cb-zone" data-zg={zoneGroupKey(n)} data-selected={selected || undefined} onClick={() => onPick(n)}>
      <b>{n}</b>
      {zone?.label.split(" — ")[0]}
    </button>
  );
}

function NeedPill({ signed, need }: { signed: number; need: number | null }) {
  if (!need) {
    return (
      <span className="cb-need" data-state="unset" title="Nobody has said yet how many people this needs">
        <Users size={14} aria-hidden="true" />
        {signed ? `${signed} · ` : ""}need not set
      </span>
    );
  }
  const full = signed >= need;
  const label = full ? `${signed} of ${need} people, full` : `${signed} of ${need} people signed up, ${need - signed} still needed`;
  return (
    <span className="cb-need" data-state={full ? "full" : "short"} title={label} aria-label={label}>
      <Users size={14} aria-hidden="true" />
      {signed} / {need}
    </span>
  );
}

export default function CrewBuild({ dateTime, person, build, onlyMine, onNeedPerson }: Props) {
  const phases = BUILD_DAYS[dateTime];
  const { state } = build;
  const [selected, setSelected] = useState<string | null>(null);
  const [mapSize, setMapSize] = useState<MapSize>("fit");
  const [stickTop, setStickTop] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [show, setShow] = useState<Show>("all");

  useEffect(() => {
    setMapSize(readMapSize());
    setShow(readShow());
  }, []);

  const chooseShow = (next: Show) => {
    setShow(next);
    try {
      localStorage.setItem(SHOW_KEY, next);
    } catch {
      // Blocked storage: the choice holds until the page is left.
    }
  };

  // The map pins under the sticky person picker, whatever its height on this screen.
  useEffect(() => {
    const picker = document.getElementById("vol-picker");
    if (!picker) return;
    const measure = () => setStickTop(picker.getBoundingClientRect().height);
    measure();
    const observer = "ResizeObserver" in window ? new ResizeObserver(measure) : null;
    observer?.observe(picker);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const chooseSize = (next: MapSize) => {
    setMapSize(next);
    try {
      localStorage.setItem(MAP_KEY, next);
    } catch {
      // Blocked storage: the choice holds until the page is left.
    }
  };

  const centerOn = (n: string) => {
    const zone = zoneOf(n);
    const scroller = scrollRef.current;
    const svg = svgRef.current;
    if (!zone || !scroller || !svg) return;
    const left = ((zone.x - VIEW.x) / VIEW.w) * svg.clientWidth - scroller.clientWidth / 2;
    scroller.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  };

  useEffect(() => {
    if (selected && mapSize === "large") centerOn(selected);
  }, [selected, mapSize]);

  const pickFromList = (n: string) => {
    setSelected(n);
    if (mapSize === "hidden") chooseSize("fit");
  };

  const pickFromMap = (n: string) => {
    const next = selected === n ? null : n;
    setSelected(next);
    if (!next) return;
    const first = rootRef.current?.querySelector(`[data-zones~="${CSS.escape(n.replace(" ", "_"))}"]`);
    first?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mine = (item: BuildItem, phase: BuildPhase) =>
    Boolean(person) &&
    (assigneesOf(state, item.id, phase).includes(person!) ||
      (phase === "teardown" && assigneesOf(state, item.id, "setup").includes(person!)));

  /** Still short of people: fewer than needed, or no headcount yet and nobody on it. Ticked tasks are not. */
  const needsPeople = (item: BuildItem, phase: BuildPhase) => {
    if (tickOf(state, item.id, phase)) return false;
    const signed = assigneesOf(state, item.id, phase).length;
    const need = neededFor(item);
    return need ? signed < need : signed === 0;
  };

  const shows = (item: BuildItem, phase: BuildPhase) =>
    show === "needs" ? needsPeople(item, phase) : show === "open" ? !tickOf(state, item.id, phase) : true;

  const visible = useMemo(
    () =>
      (phases ?? []).map((phase) => ({
        phase,
        tasks: taskSections(phase)
          .map((section) => ({
            ...section,
            items: section.items.filter((item) => (!onlyMine || mine(item, phase)) && shows(item, phase)),
          }))
          .filter((section) => section.items.length),
        // The checklist has no headcount, so "Needs people" leaves it out.
        material:
          onlyMine || show === "needs"
            ? []
            : materialSections(phase)
                .map((section) => ({ ...section, items: section.items.filter((item) => shows(item, phase)) }))
                .filter((section) => section.items.length),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phases, onlyMine, person, state, show]
  );

  // Counts on the switch: tasks of this day, whatever the current choice.
  const dayTasks = (phases ?? []).flatMap((phase) =>
    taskSections(phase).flatMap((section) => section.items.map((item) => ({ item, phase })))
  );
  const showCounts: Record<Show, number> = {
    needs: dayTasks.filter(({ item, phase }) => needsPeople(item, phase)).length,
    open: dayTasks.filter(({ item, phase }) => !tickOf(state, item.id, phase)).length,
    all: dayTasks.length,
  };

  if (!phases) return null;

  const hereCount = selected
    ? visible.reduce(
        (sum, part) =>
          sum +
          [...part.tasks, ...part.material].reduce(
            (count, section) => count + section.items.filter((item) => item.zones?.includes(selected)).length,
            0
          ),
        0
      )
    : 0;

  const zoneAttr = (item: BuildItem) => (item.zones ?? []).map((z) => z.replace(" ", "_")).join(" ");
  const isHere = (item: BuildItem) => Boolean(selected && item.zones?.includes(selected));

  const join = (item: BuildItem, phase: BuildPhase) => {
    if (!person) return onNeedPerson();
    build.assign(item.id, person, phase, true);
  };

  const renderTask = (item: BuildItem, phase: BuildPhase) => {
    const info = BUILD_PHASES[phase];
    const people = assigneesOf(state, item.id, phase);
    const need = neededFor(item);
    const done = tickOf(state, item.id, phase);
    const open = need ? Math.max(0, need - people.length) : 0;
    const setupBy = phase === "teardown" ? assigneesOf(state, item.id, "setup") : [];
    return (
      <article
        key={item.id}
        className="cb-task"
        data-done={done ? "" : undefined}
        data-here={isHere(item) || undefined}
        data-zg={selected ? zoneGroupKey(selected) : undefined}
        data-zones={zoneAttr(item)}
      >
        <button
          type="button"
          className="cb-tick"
          role="checkbox"
          aria-checked={Boolean(done)}
          aria-label={`${taskDoneLabel(phase)}: ${item.name}`}
          onClick={() => build.tick(item.id, phase, !done, person)}
        >
          <Check size={20} aria-hidden="true" />
        </button>
        <div className="cb-task__body">
          <div className="cb-task__top">
            <p className="cb-task__name">
              {item.name}
              {item.draft && <span className="cb-draft">Draft</span>}
            </p>
            <NeedPill signed={people.length} need={need} />
          </div>
          <p className="cb-task__what" data-empty={!item.what || undefined}>
            {item.what ?? "To be described."}
          </p>
          {item.zones?.length ? (
            <div className="cb-chips">
              {item.zones.map((n) => (
                <ZoneChip key={n} n={n} selected={selected === n} onPick={pickFromList} />
              ))}
            </div>
          ) : null}
          {item.lead && (
            <p className="cb-task__meta">
              Lead: <strong>{item.lead}</strong>
            </p>
          )}
          {item.detail && item.detail !== item.what && <p className="cb-task__meta">{item.detail}</p>}
          {phase === "teardown" && (
            <p className="cb-task__meta">
              {setupBy.length ? (
                <>
                  Set up by <strong>{setupBy.join(", ")}</strong>
                </>
              ) : (
                "Nobody signed up for the setup."
              )}
            </p>
          )}
          <div className="cb-who">
            {people.map((name) => (
              <span key={name} className="cb-person" data-me={name === person || undefined}>
                {name}
                {name === person && (
                  <button type="button" aria-label="Remove me" onClick={() => build.assign(item.id, name, phase, false)}>
                    <X size={14} aria-hidden="true" />
                  </button>
                )}
              </span>
            ))}
            {open > 0 && (
              <span className="cb-slot">
                {open} open {open === 1 ? "spot" : "spots"}
              </span>
            )}
            {!(person && people.includes(person)) && (
              <button type="button" className="cb-join" onClick={() => join(item, phase)}>
                <Plus size={15} aria-hidden="true" />
                {info.joinLabel}
              </button>
            )}
          </div>
          {done && (
            <p className="cb-status">
              {taskDoneLabel(phase)}
              {done.by ? ` by ${done.by}` : ""} · {done.done_at.slice(11, 16)} UTC
            </p>
          )}
        </div>
      </article>
    );
  };

  const renderMaterial = (item: BuildItem, phase: BuildPhase) => {
    const info = BUILD_PHASES[phase];
    const done = tickOf(state, item.id, phase);
    const facts = [item.qty, item.who, item.status].filter(Boolean);
    return (
      <article key={item.id} className="cb-mat" data-done={done ? "" : undefined} data-here={isHere(item) || undefined} data-zg={selected ? zoneGroupKey(selected) : undefined} data-zones={zoneAttr(item)}>
        <button
          type="button"
          className="cb-tick cb-tick--small"
          role="checkbox"
          aria-checked={Boolean(done)}
          aria-label={`${info.doneLabel}: ${item.name}`}
          onClick={() => build.tick(item.id, phase, !done, person)}
        >
          <Check size={16} aria-hidden="true" />
        </button>
        <div>
          <p className="cb-mat__name">{item.name}</p>
          {facts.length > 0 && <p className="cb-mat__facts">{facts.join(" · ")}</p>}
          {item.zones?.length ? (
            <div className="cb-chips">
              {item.zones.map((n) => (
                <ZoneChip key={n} n={n} selected={selected === n} onPick={pickFromList} />
              ))}
            </div>
          ) : null}
          {done && (
            <p className="cb-status">
              {info.doneLabel}
              {done.by ? ` · ${done.by}` : ""} · {done.done_at.slice(11, 16)} UTC
            </p>
          )}
        </div>
      </article>
    );
  };

  const sectionCounts = (section: BuildSection, phase: BuildPhase) => {
    const withNeed = section.items.filter((item) => item.people);
    const needSum = withNeed.reduce((sum, item) => sum + (item.people ?? 0), 0);
    const filled = withNeed.reduce((sum, item) => sum + Math.min(assigneesOf(state, item.id, phase).length, item.people ?? 0), 0);
    const done = section.items.filter((item) => tickOf(state, item.id, phase)).length;
    return { needSum, filled, done };
  };

  const selectedZone = selected ? zoneOf(selected) : null;

  return (
    <section ref={rootRef} className="cb" aria-label="Build crew" style={{ "--cb-top": `${stickTop}px` } as CSSProperties}>
      <div className="cb-layout">
        <div className="cb-mapcol">
          <div className="cb-map" data-size={mapSize}>
            {mapSize === "hidden" ? (
              <button type="button" className="cb-tool" onClick={() => chooseSize("fit")}>
                <MapPin size={14} aria-hidden="true" />
                Show the plan
              </button>
            ) : (
              <>
                <div className="cb-map__tools">
                  <button type="button" className="cb-tool cb-tool--phone" onClick={() => chooseSize(mapSize === "large" ? "fit" : "large")}>
                    {mapSize === "large" ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
                    {mapSize === "large" ? "Smaller" : "Larger"}
                  </button>
                  <button type="button" className="cb-tool cb-tool--phone" onClick={() => chooseSize("hidden")} aria-label="Hide the plan">
                    <ChevronUp size={14} aria-hidden="true" />
                    Hide
                  </button>
                </div>
                <div ref={scrollRef} className="cb-map__scroll">
                  <svg
                    ref={svgRef}
                    className="cb-plan"
                    data-has-selection={selected ? "" : undefined}
                    viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
                    role="img"
                    aria-label="Floor plan of the KuK with the numbered zones"
                  >
                    <image href={withBase("img/venue-plan.svg")} x="0" y="0" width="1190.4" height="841.68" />
                    <g>
                      {BUILD_ZONES.map((zone) => (
                        <rect
                          key={zone.n}
                          className="cb-plan__area"
                          data-zg={zoneGroupKey(zone.n)}
                          data-selected={selected === zone.n || undefined}
                          x={zone.area[0]}
                          y={zone.area[1]}
                          width={zone.area[2]}
                          height={zone.area[3]}
                          rx="5"
                          onClick={() => pickFromMap(zone.n)}
                        >
                          <title>{`${zone.n} · ${zone.label}`}</title>
                        </rect>
                      ))}
                    </g>
                    <g>
                      {BUILD_ZONES.map((zone) => (
                        <g
                          key={zone.n}
                          className="cb-plan__marker"
                          data-zg={zoneGroupKey(zone.n)}
                          data-selected={selected === zone.n || undefined}
                          onClick={() => pickFromMap(zone.n)}
                        >
                          <title>{`${zone.n} · ${zone.label}`}</title>
                          <circle cx={zone.x} cy={zone.y} r="14" />
                          <text x={zone.x} y={zone.y}>
                            {shortZone(zone.n)}
                          </text>
                        </g>
                      ))}
                    </g>
                  </svg>
                </div>
                <p className="cb-map__caption" aria-live="polite">
                  {selectedZone ? (
                    <>
                      <i data-zg={zoneGroupKey(selectedZone.n)} />
                      <strong>{selectedZone.n}</strong> · {selectedZone.label} · {hereCount} {hereCount === 1 ? "item" : "items"} here
                    </>
                  ) : (
                    <span>Tap a coloured space or a number</span>
                  )}
                </p>
              </>
            )}
          </div>
          <ul className="cb-legend">
            {BUILD_ZONES.map((zone) => (
              <li key={zone.n}>
                <button type="button" data-selected={selected === zone.n || undefined} onClick={() => pickFromMap(zone.n)}>
                  <span className="cb-zone" data-zg={zoneGroupKey(zone.n)}>
                    <b>{zone.n}</b>
                  </span>
                  {zone.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="cb-main">
          <div className="cb-filter" role="radiogroup" aria-label="Show tasks">
            {SHOWS.map(({ id, label }) => (
              <button key={id} type="button" role="radio" aria-checked={show === id} onClick={() => chooseShow(id)}>
                {label}
                <span className="cb-filter__count">{showCounts[id]}</span>
              </button>
            ))}
          </div>
          {show === "needs" && (
            <p className="cb-invite">
              <HandHeart size={18} aria-hidden="true" />
              <span>
                <strong>Help needed.</strong> These tasks still need people. Pick your name at the top, then sign up on
                any task below. Every pair of hands counts.
              </span>
            </p>
          )}
          {show === "open" && (
            <p className="cb-invite">
              <HandHeart size={18} aria-hidden="true" />
              <span>
                <strong>Thank you! Done with your own task?</strong> Pick any task below that isn’t ticked yet and lend a
                hand. Stay until it’s ticked off, or until the people on it say they have enough help.
              </span>
            </p>
          )}
          {build.error && <p className="cb-error">{build.error}</p>}
          {visible.map(({ phase, tasks, material }) => {
            const info = BUILD_PHASES[phase];
            // Stats always cover the whole part, whatever the switch shows.
            const all = taskSections(phase).flatMap((section) => section.items);
            const needSum = all.reduce((sum, item) => sum + (item.people ?? 0), 0);
            const filled = all.reduce((sum, item) => sum + (item.people ? Math.min(assigneesOf(state, item.id, phase).length, item.people) : 0), 0);
            const unset = all.filter((item) => !item.people).length;
            const done = all.filter((item) => tickOf(state, item.id, phase)).length;
            const materialItems = material.flatMap((section) => section.items);
            const materialAll = materialSections(phase).flatMap((section) => section.items);
            const materialDone = materialAll.filter((item) => tickOf(state, item.id, phase)).length;
            return (
              <div key={phase} id={`vol-build-${phase}`} className="cb-phase">
                <header className="cb-phase__head">
                  <p className="cb-phase__time">{phaseTime(phase)}</p>
                  <h3 className="cb-phase__title">{info.label}</h3>
                  {info.timeNote && <p className="cb-phase__note">{info.timeNote}</p>}
                  <p className="cb-phase__stats">
                    <strong>{done}</strong>/{all.length} {taskDoneLabel(phase).toLowerCase()}
                    {needSum > 0 && (
                      <>
                        {" · "}
                        <strong>{filled}</strong>/{needSum} people
                      </>
                    )}
                    {unset > 0 && ` · ${unset} without a headcount`}
                  </p>
                </header>

                {tasks.length === 0 && (
                  <p className="cb-empty">
                    {onlyMine
                      ? "Nothing signed up here yet."
                      : show === "needs"
                        ? "Every task here has enough people for now. Thank you!"
                        : show === "open"
                          ? "Everything here is done."
                          : "No tasks."}
                  </p>
                )}
                {tasks.map((section) => {
                  const counts = sectionCounts(section, phase);
                  return (
                    <div key={section.id} className="cb-section">
                      <h4 className="cb-section__title">
                        {section.title}
                        {counts.needSum > 0 ? (
                          <span>
                            {counts.filled}/{counts.needSum} people
                          </span>
                        ) : section.people ? (
                          <span>canvas: {section.people} people for this block</span>
                        ) : null}
                      </h4>
                      {section.note && <p className="cb-section__note">{section.note}</p>}
                      {section.items.map((item) => renderTask(item, phase))}
                    </div>
                  );
                })}

                {materialItems.length > 0 && (
                  <details className="cb-material">
                    <summary>
                      <span>Material checklist</span>
                      <span className="cb-material__count">
                        {materialDone}/{materialAll.length} {info.doneLabel.toLowerCase()}
                      </span>
                    </summary>
                    <p className="cb-section__note">
                      {phase === "unload" ? "Tick each item when it has arrived at the KuK." : "Tick each item when it is back on the truck."}
                    </p>
                    {material.map((section) => (
                      <div key={section.id} className="cb-section">
                        <h4 className="cb-section__title">{section.title}</h4>
                        {section.items.map((item) => renderMaterial(item, phase))}
                      </div>
                    ))}
                  </details>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
