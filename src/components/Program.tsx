import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import {
  ArrowUpRight,
  AudioLines,
  BookOpen,
  Coffee,
  DoorOpen,
  Flower2,
  GraduationCap,
  Handshake,
  type LucideIcon,
  MessagesSquare,
  Mic2,
  Moon,
  Music,
  Paintbrush,
  Palette,
  PartyPopper,
  Sparkles,
  Ticket,
  Utensils,
  UtensilsCrossed,
  Wind,
  Wine,
} from "lucide-react";
import { PROGRAM, type ProgramDay, type ProgramItem } from "../data/program";
import { EXPERIENCE_DAYS, EXPERIENCE_PORTRAITS, type ExperienceCredit } from "../data/experiences";
import {
  FRIDAY_PANEL_SPEAKER_NAMES,
  getImageCrop,
  SATURDAY_PANEL_SPEAKER_NAMES,
  speakerByName,
  speakersNamed,
  type Speaker,
} from "../data/speakers";
import { FRIDAY_PANEL, SATURDAY_PANEL } from "../data/bookletContent";
import { WORKSHOP_DAY, WORKSHOP_TRACKS } from "../data/workshops";
import CalendarSubscribe from "./CalendarSubscribe";
import MapAddress from "./MapAddress";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { getExperienceModalId, openExperienceModal } from "../lib/experienceModal";
import { getSpeakerModalId, openSpeakerModal } from "../lib/speakerModal";
import { getPanelModalId, openPanelModal, PANEL_MODAL_EVENT, type PanelId } from "../lib/panelModal";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

type ScheduleView = "talks" | "experiences" | "workshops";
type ScheduleItem = ProgramItem & {
  people?: string[];
  allDay?: boolean;
  credits?: ExperienceCredit[];
  href?: string;
  icon?: LucideIcon;
};
type ScheduleDay = Omit<ProgramDay, "items"> & { items: ScheduleItem[] };

// The pre-conference Workshop Day: four parallel tracks in one afternoon, booked separately.
const WORKSHOP_SCHEDULE: ScheduleDay[] = [
  {
    day: WORKSHOP_DAY.day,
    date: WORKSHOP_DAY.date,
    dateTime: WORKSHOP_DAY.dateTime,
    items: WORKSHOP_TRACKS.map((track) => ({
      time: WORKSHOP_DAY.time,
      title: track.title,
      detail: track.presenters,
      venue: track.language,
      menuNote: `${track.places} places`,
      href: withBase("/workshops#tracks"),
      icon: GraduationCap,
    })),
  },
];

const PANELS: Record<PanelId, {
  title: string;
  subtitle?: string;
  body: string;
  speakers: Speaker[];
  eyebrow: string;
}> = {
  friday: {
    title: FRIDAY_PANEL.title,
    subtitle: FRIDAY_PANEL.subtitle,
    body: FRIDAY_PANEL.body,
    speakers: speakersNamed(FRIDAY_PANEL_SPEAKER_NAMES),
    eyebrow: "Friday panel · 18:15–19:15",
  },
  saturday: {
    title: SATURDAY_PANEL.title,
    body: SATURDAY_PANEL.body,
    speakers: speakersNamed(SATURDAY_PANEL_SPEAKER_NAMES),
    eyebrow: "Saturday panel · 18:00–19:00",
  },
};

// Split repeat sessions into individual rows and sort by their actual start time.
const EXPERIENCE_SCHEDULE: ScheduleDay[] = EXPERIENCE_DAYS.map((day) => ({
  ...day,
  items: day.items.flatMap((item) => item.time.split(" & ").map((time) => ({
    time,
    title: item.title,
    detail: item.personName && item.personName !== item.title ? item.personName : undefined,
    menuNote: item.detail,
    venue: item.venue,
    experienceName: item.personName,
    people: item.credits?.map((credit) => credit.name) ?? item.personNames,
    credits: item.credits,
    allDay: item.kind === "allday",
    kind: item.personName === "Afterparty" ? "social" as const : "session" as const,
  }))).sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.time.localeCompare(b.time)),
}));

function speakerPortrait(name?: string) {
  const speaker = name ? speakerByName(name) : undefined;
  if (!speaker?.image) return undefined;
  return {
    src: withBase(`img/speakers/${speaker.image}`),
    position: getImageCrop(speaker.image).position,
  };
}

function experiencePortrait(name?: string) {
  if (!name) return undefined;
  const portrait = EXPERIENCE_PORTRAITS[name];
  if (!portrait) return undefined;
  return {
    src: withBase(`img/experiences/${portrait.file}`),
    position: portrait.position,
  };
}

function facilitatorName(item: ScheduleItem) {
  if (item.people?.length === 1) return item.people[0];
  if (item.people && item.people.length > 1) return undefined;
  if (item.experienceName && EXPERIENCE_PORTRAITS[item.experienceName]) return item.experienceName;
  return undefined;
}

function PortraitMark({ src, position, small = false }: { src: string; position: string; small?: boolean }) {
  return (
    <span className={`program-item__mark program-item__mark--photo${small ? " program-item__mark--sm" : ""}`} aria-hidden="true">
      <img src={src} alt="" style={{ objectPosition: position }} />
    </span>
  );
}

function iconForItem(item: ScheduleItem): LucideIcon {
  if (item.icon) return item.icon;
  const title = item.title.toLowerCase();
  if (title.includes("coffee") || title === "break") return Coffee;
  if (title.includes("lunch")) return Utensils;
  if (title.includes("dinner")) return UtensilsCrossed;
  if (title.includes("doors")) return DoorOpen;
  if (title === "opening") return Sparkles;
  if (title.includes("panel")) return MessagesSquare;
  if (title.includes("evening")) return Moon;
  if (title.includes("closing")) return Mic2;
  if (title.includes("apéro") || title.includes("apero")) return Wine;
  if (title.includes("afterparty")) return PartyPopper;
  if (title.includes("exhibition")) return Palette;
  if (title.includes("painting")) return Paintbrush;
  if (title.includes("sound") || title.includes("meditation")) return AudioLines;
  if (title.includes("speed-friending") || title.includes("speed friending")) return Handshake;
  if (title.includes("story")) return BookOpen;
  if (title.includes("yoga")) return Flower2;
  if (title.includes("breath")) return Wind;
  if (title.includes("concert")) return Music;
  if (item.kind === "pause") return Coffee;
  return Sparkles;
}

function ProgramItemMark({ item }: { item: ScheduleItem }) {
  const portrait = speakerPortrait(item.speakerName) ?? experiencePortrait(facilitatorName(item));
  if (portrait) return <PortraitMark src={portrait.src} position={portrait.position} />;
  if (item.panel || (item.people && item.people.length > 1)) return null;
  const Icon = iconForItem(item);
  const accent = item.kind === "social" || item.allDay || item.detailHighlight;
  return (
    <span className={`program-item__mark program-item__mark--icon${accent ? " program-item__mark--accent" : ""}`} aria-hidden="true">
      <Icon size={18} strokeWidth={2.25} />
    </span>
  );
}

function ProgramItemWhen({ item }: { item: ScheduleItem }) {
  return (
    <span className="program-item__when">
      <span className="program-item__time">{item.time}</span>
      {item.venue && <span className="program-item__venue">{item.venue}</span>}
    </span>
  );
}

function facilitatorNames(item: ScheduleItem) {
  if (item.people?.length) return item.people;
  const name = facilitatorName(item) ?? item.experienceName;
  if (name && name !== item.title) return [name];
  return [];
}

function experienceCredits(item: ScheduleItem): ExperienceCredit[] {
  if (item.credits?.length) return item.credits;
  return facilitatorNames(item).map((name) => ({ name }));
}

function ExperienceCredits({ item }: { item: ScheduleItem }) {
  const credits = experienceCredits(item);
  if (!credits.length) return null;
  const linkedRow = Boolean(item.speakerName || item.experienceName || item.panel);
  const showPhotos = credits.length > 1;
  return (
    <>
      <span className="program-item__sep" aria-hidden="true">·</span>
      <span className="program-item__people">
        {credits.map((credit) => {
          const portrait = showPhotos ? experiencePortrait(credit.name) : undefined;
          const label = (
            <>
              {portrait && <PortraitMark src={portrait.src} position={portrait.position} small />}
              {credit.name}
              {credit.type && <span className="program-item__credit-type">{credit.type}</span>}
              {!linkedRow && <ArrowUpRight size={12} aria-hidden="true" />}
            </>
          );
          if (linkedRow) {
            return <span key={credit.name} className="program-item__with">{label}</span>;
          }
          return (
            <a key={credit.name} href={`#${getExperienceModalId(credit.name)}`} onClick={(event) => {
              event.preventDefault();
              openExperienceModal(credit.name);
            }}>
              {label}
            </a>
          );
        })}
      </span>
    </>
  );
}

function ProgramItemDetail({ item }: { item: ScheduleItem }) {
  if (item.panel) {
    return <span className="program-item__detail">{PANELS[item.panel].title}</span>;
  }
  const names = facilitatorNames(item);
  const detailIsFacilitator = Boolean(item.detail && names.includes(item.detail));
  return (
    <>
      {item.detail && !detailIsFacilitator && (
        <span className={`program-item__detail${item.detailHighlight ? " program-item__detail--highlight" : ""}`}>
          {item.detail}
        </span>
      )}
      {item.address && item.mapUrl && <span className="program-item__detail"><MapAddress address={item.address} href={item.mapUrl} /></span>}
      {item.menuNote && <span className="program-item__note">{item.menuNote}</span>}
    </>
  );
}

function itemHref(item: ScheduleItem) {
  if (item.speakerName) return `#${getSpeakerModalId(item.speakerName)}`;
  if (item.panel) return `#${getPanelModalId(item.panel)}`;
  return `#${getExperienceModalId(item.experienceName!)}`;
}

function openItem(item: ScheduleItem) {
  if (item.speakerName) openSpeakerModal(item.speakerName);
  else if (item.panel) openPanelModal(item.panel);
  else openExperienceModal(item.experienceName!);
}

const SCHEDULES: Record<ScheduleView, ScheduleDay[]> = {
  talks: PROGRAM,
  experiences: EXPERIENCE_SCHEDULE,
  workshops: WORKSHOP_SCHEDULE,
};

function ProgramSchedule({ view }: { view: ScheduleView }) {
  const days = SCHEDULES[view];
  return (
    <div className={`program-board${days.length === 1 ? " program-board--single" : ""}`}>
      {days.map((day) => (
        <article className="program-day" key={day.day} aria-labelledby={`program-${view}-${day.day}`}>
          <header className="program-day__header">
            <h3 id={`program-${view}-${day.day}`}>{day.day}</h3>
            <time dateTime={day.dateTime}>{day.date} 2026</time>
          </header>
          <ol className="program-list">
            {day.items.map((item: ScheduleItem) => {
              const modalLinked = Boolean(item.speakerName || item.experienceName || item.panel);
              const linked = modalLinked || Boolean(item.href);
              const copy = (
                <div className="program-item__copy">
                  <div className="program-item__headline">
                    <ProgramItemMark item={item} />
                    <p>
                      {item.title}
                      {view === "experiences" && <ExperienceCredits item={item} />}
                    </p>
                  </div>
                  <ProgramItemDetail item={item} />
                </div>
              );
              return (
                <li className={`program-item program-item--${item.kind ?? "session"}${linked ? " program-item--linked" : ""}${item.allDay ? " program-item--allday" : ""}`} key={`${item.time}-${item.title}`}>
                  {linked ? (
                    <a className="program-session-link" href={item.href ?? itemHref(item)} onClick={modalLinked ? (event) => {
                      event.preventDefault();
                      openItem(item);
                    } : undefined} aria-label={modalLinked
                      ? `View ${item.panel ? "panel" : item.speakerName ? "talk" : "experience"} details for ${item.panel ? PANELS[item.panel].title : item.title}, ${day.day} ${item.time}`
                      : `View workshop details for ${item.title}, ${day.day} ${item.time}`}>
                      <ProgramItemWhen item={item} />
                      {copy}
                      <ArrowUpRight className="program-item__arrow" size={15} aria-hidden="true" />
                    </a>
                  ) : <><ProgramItemWhen item={item} />{copy}</>}
                </li>
              );
            })}
          </ol>
        </article>
      ))}
    </div>
  );
}

function PanelModal({
  panelId,
  open,
  onClose,
  onExited,
}: {
  panelId: PanelId;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const panel = PANELS[panelId];
  const headingId = `${getPanelModalId(panelId)}-title`;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onCloseRef.current();
    document.addEventListener("keydown", handleKey);
    lockBodyScroll();
    focusWithoutScroll(closeRef.current);
    return () => {
      document.removeEventListener("keydown", handleKey);
      unlockBodyScroll();
    };
  }, []);

  useModalMotion(open, overlayRef, cardRef, onExited);

  return createPortal(
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0${open ? "" : " pointer-events-none"}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        ref={cardRef}
        className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-dark border border-white/10 rounded-[1.25rem] shadow-2xl p-6 sm:p-8 opacity-0"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10 cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
        <p className="text-sm text-support-light font-medium tracking-wide uppercase mb-2">{panel.eyebrow}</p>
        <h3 id={headingId} className="text-xl font-semibold text-white text-balance pr-8">{panel.title}</h3>
        {panel.subtitle && <p className="mt-2 text-white/70 text-base">{panel.subtitle}</p>}
        <p className="mt-5 text-sm text-white/70 leading-relaxed">{panel.body}</p>
        <ul className="program-panel-speakers">
          {panel.speakers.map((speaker) => {
            const portrait = speakerPortrait(speaker.name);
            return (
              <li key={speaker.name}>
                <button type="button" onClick={() => {
                  onClose();
                  openSpeakerModal(speaker.name);
                }}>
                  {portrait && <PortraitMark src={portrait.src} position={portrait.position} />}
                  <span>
                    <strong>{speaker.name}</strong>
                    <em>{speaker.role} · {speaker.institution}</em>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body
  );
}

const TAB_LABELS: Record<ScheduleView, string> = {
  talks: "Talks",
  experiences: "Experiences",
  workshops: "Workshop Day",
};

const TAB_INTROS: Record<ScheduleView, string> = {
  talks: "Research talks, panel discussions and time to connect. Select a speaker or panel to read more.",
  experiences: "Art, sound, movement and connection alongside the talks. Select a session for details; some sessions overlap.",
  workshops: "Four parallel Psychedelic-Assisted Therapy training tracks on the afternoon before the conference opens, each combining theoretical input with experiential clinical practice. Select a track to read more.",
};

function WorkshopDayNotice() {
  return (
    <div className="program-notice">
      <Ticket className="program-notice__icon" size={20} aria-hidden="true" />
      <div className="program-notice__body">
        <p className="program-notice__title">Separate ticket — the day before the conference</p>
        <p>
          The Workshop Day runs on Thursday 8 October, one day before ALPS 2026 opens. It is booked
          separately and is not included in a conference ticket. Places are limited and accredited for
          4 FSP credits.
        </p>
        <span className="program-notice__actions">
          <a href={withBase("/workshops")}>
            Workshop Day details
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
          <a href={WORKSHOP_DAY.ticketUrl} target="_blank" rel="noopener noreferrer">
            Buy a workshop ticket
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </span>
      </div>
    </div>
  );
}

export default function Program() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);
  const [view, setView] = useState<ScheduleView>("talks");
  const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
  const { present: panelPresent, onExited: onPanelExited } = useModalPresence(Boolean(openPanel));
  const lastPanel = useRef<PanelId>("friday");
  if (openPanel) lastPanel.current = openPanel;
  const views = ["talks", "experiences", "workshops"] as const;

  useEffect(() => {
    const panelFromHash = () => {
      const hash = window.location.hash.slice(1);
      if (hash === getPanelModalId("friday")) return "friday";
      if (hash === getPanelModalId("saturday")) return "saturday";
      return null;
    };
    const syncFromHash = () => setOpenPanel(panelFromHash());
    const handleOpen = (event: Event) => {
      const { panelId } = (event as CustomEvent<{ panelId: string }>).detail;
      setOpenPanel(panelId === getPanelModalId("friday") ? "friday" : panelId === getPanelModalId("saturday") ? "saturday" : null);
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener(PANEL_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener(PANEL_MODAL_EVENT, handleOpen);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-fade-up]").forEach((item) => { item.style.opacity = "1"; });
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated.current) {
        hasAnimated.current = true;
        animate(el.querySelectorAll("[data-fade-up]"), {
          opacity: [0, 1], translateY: [18, 0],
          delay: (_: unknown, i: number) => i * 80,
          duration: 620, easing: "easeOutCubic",
        });
      }
    }, { threshold: 0.08 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const closePanel = () => {
    setOpenPanel(null);
    if (window.location.hash === `#${getPanelModalId("friday")}` || window.location.hash === `#${getPanelModalId("saturday")}`) {
      setLocationHash(null, "replace");
    }
  };

  return (
    <section ref={sectionRef} id="program" className="relative py-24 sm:py-32 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 program-heading">
          <div>
            <p className="section-eyebrow">{view === "workshops" ? "Thursday, 8 October 2026" : "Friday–Saturday, 9–10 October 2026"}</p>
            <h2 className="section-title">{view === "workshops" ? "Workshop Day program" : "Conference program"}</h2>
          </div>
          <div className="program-tabs-wrap">
            <div className="program-tabs" role="tablist" aria-label="Program type">
              {views.map((option) => (
                <button key={option} id={`program-tab-${option}`} type="button" role="tab" aria-selected={view === option} aria-controls={`program-panel-${option}`} tabIndex={view === option ? 0 : -1} onClick={() => setView(option)} onKeyDown={(event) => {
                  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const next = event.key === "Home" ? views[0] : event.key === "End" ? views[views.length - 1] : views[(views.indexOf(option) + (event.key === "ArrowLeft" ? views.length - 1 : 1)) % views.length];
                  setView(next);
                  document.getElementById(`program-tab-${next}`)?.focus({ preventScroll: true });
                }}>{TAB_LABELS[option]}</button>
              ))}
            </div>
          </div>
        </div>
        <div data-fade-up className="opacity-0">
          {views.map((option) => (
            <div key={option} id={`program-panel-${option}`} role="tabpanel" aria-labelledby={`program-tab-${option}`} hidden={view !== option} tabIndex={0}>
              <div className="program-intro-row">
                <p className="program-intro">{TAB_INTROS[option]}</p>
                {option !== "workshops" && (
                  <CalendarSubscribe feed={option} label={option === "talks" ? "Add talks to calendar" : "Add experiences to calendar"} />
                )}
              </div>
              {option === "workshops" && <WorkshopDayNotice />}
              <ProgramSchedule view={option} />
            </div>
          ))}
        </div>
        <p data-fade-up className="opacity-0 program-footnote">All times are local to Aarau, Switzerland. Program and timings are subject to change.</p>
      </div>
      {panelPresent && (
        <PanelModal panelId={openPanel ?? lastPanel.current} open={Boolean(openPanel)} onClose={closePanel} onExited={onPanelExited} />
      )}
    </section>
  );
}
