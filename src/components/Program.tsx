import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Maximize2, MessageCircle, Music, PersonStanding, Sparkles, Users, Waves, Wind, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PROGRAM, type ProgramExperience } from "../data/program";
import MapAddress from "./MapAddress";
import { getExperienceModalId, openExperienceModal } from "../lib/experienceModal";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { getSpeakerModalId, openSpeakerModal } from "../lib/speakerModal";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

const EXPERIENCE_ICONS: Record<string, LucideIcon> = {
  "Sound meditation": Waves,
  Breathwork: Wind,
  "Speed-friending": Users,
  Yoga: PersonStanding,
  "Live Concert": Music,
  Storytelling: MessageCircle,
};

function ProgramExperienceHints({
  activities,
  onOpen,
}: {
  activities: ProgramExperience[];
  onOpen: (name: string) => void;
}) {
  return (
    <div className="program-experience-hints">
      {activities.map((activity) => {
        const Icon = EXPERIENCE_ICONS[activity.title] ?? Sparkles;
        const tooltip = `${activity.title} (${activity.time})`;
        return (
          <button
            key={`${activity.title}-${activity.time}`}
            type="button"
            className="program-experience-hint"
            data-tooltip={tooltip}
            aria-label={`${tooltip}. View details.`}
            onClick={() => onOpen(activity.personName)}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

function ProgramItemDetail({ item }: { item: (typeof PROGRAM)[number]["items"][number] }) {
  return (
    <>
      {item.detail && (
        <span style={item.detailHighlight ? { color: "var(--color-accent-light)", fontStyle: "normal", fontWeight: 600 } : undefined}>
          {item.detail}
        </span>
      )}
      {item.address && item.mapUrl && (
        <span>
          <MapAddress address={item.address} href={item.mapUrl} />
        </span>
      )}
      {item.menuNote && (
        <span style={{ color: "rgba(255,255,255,0.42)", fontStyle: "italic", fontSize: "0.78rem" }}>{item.menuNote}</span>
      )}
    </>
  );
}

function ProgramSchedule({
  expanded = false,
  onSpeakerOpen,
  onExperienceOpen,
}: {
  expanded?: boolean;
  onSpeakerOpen: (speakerName: string) => void;
  onExperienceOpen: (name: string) => void;
}) {
  return (
    <div className={`program-board ${expanded ? "program-board--expanded" : ""}`}>
      {PROGRAM.map((day, dayIndex) => (
        <article className="program-day" key={day.day}>
          <header className="program-day__header">
            <span>Day {String(dayIndex + 1).padStart(2, "0")}</span>
            <div>
              <h3>{day.day}</h3>
              <time dateTime={day.dateTime}>{day.date}, 2026</time>
            </div>
          </header>

          <ol className="program-list">
            {day.items.map((item) => {
              const experiences = item.experiences ?? [];
              return (
                <li
                  className={`program-item program-item--${item.kind ?? "session"}${item.speakerName || item.experienceName ? " program-item--linked" : ""}${experiences.length ? " program-item--has-experience" : ""}`}
                  key={`${day.day}-${item.time}`}
                >
                  {item.speakerName || item.experienceName ? (
                    <a
                      className="program-speaker-link"
                      href={`#${item.speakerName ? getSpeakerModalId(item.speakerName) : getExperienceModalId(item.experienceName!)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        if (item.speakerName) onSpeakerOpen(item.speakerName);
                        else onExperienceOpen(item.experienceName!);
                      }}
                      aria-label={`View ${item.speakerName ? "talk" : "experience"} details for ${item.title}`}
                    >
                      <time>{item.time}</time>
                      <span className="program-speaker-link__copy">
                        <p>{item.title}</p>
                        <ProgramItemDetail item={item} />
                      </span>
                    </a>
                  ) : (
                    <>
                      <time>{item.time}</time>
                      <div>
                        <p>{item.title}</p>
                        <ProgramItemDetail item={item} />
                      </div>
                    </>
                  )}
                  {experiences.length > 0 && (
                    <ProgramExperienceHints activities={experiences} onOpen={onExperienceOpen} />
                  )}
                </li>
              );
            })}
          </ol>
        </article>
      ))}
    </div>
  );
}

export default function Program() {
  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const expandButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const hasAnimated = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const { present: expandedPresent, onExited: onExpandedExited } = useModalPresence(expanded);

  const handleSpeakerOpen = (speakerName: string) => {
    const dispatchOpen = () => openSpeakerModal(speakerName);

    if (expanded) {
      setExpanded(false);
      window.setTimeout(dispatchOpen, 0);
      return;
    }

    dispatchOpen();
  };

  const handleExperienceOpen = (name: string) => {
    const dispatchOpen = () => openExperienceModal(name);

    if (expanded) {
      setExpanded(false);
      window.setTimeout(dispatchOpen, 0);
      return;
    }

    dispatchOpen();
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-fade-up]").forEach((item) => {
        item.style.opacity = "1";
      });
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [18, 0],
            delay: (_: unknown, i: number) => i * 80,
            duration: 620,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!expandedPresent) return;

    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && setExpanded(false);
    document.addEventListener("keydown", handleKey);
    lockBodyScroll();
    return () => {
      document.removeEventListener("keydown", handleKey);
      unlockBodyScroll();
      focusWithoutScroll(expandButtonRef.current);
    };
  }, [expandedPresent]);

  useEffect(() => {
    if (expanded) focusWithoutScroll(closeButtonRef.current);
  }, [expanded]);

  useModalMotion(expanded, modalRef, modalContentRef, onExpandedExited, {
    overlayDuration: 260,
    panelDuration: 480,
    scale: 0.985,
  });

  return (
    <section ref={sectionRef} id="program" className="relative py-24 sm:py-32 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 program-heading">
          <div>
            <p className="section-eyebrow">Friday–Saturday, 9–10 October 2026</p>
            <h2 className="section-title">Scientific program</h2>
          </div>
          <button
            ref={expandButtonRef}
            type="button"
            onClick={() => setExpanded(true)}
            className="program-expand-button"
            aria-label="Expand scientific program to full screen"
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
            Expand schedule
          </button>
        </div>

        <div data-fade-up className="opacity-0">
          <ProgramSchedule onSpeakerOpen={handleSpeakerOpen} onExperienceOpen={handleExperienceOpen} />
        </div>

        <p data-fade-up className="opacity-0 mt-5 text-center text-white/50 text-sm">
          Speakers and timings are subject to change.
        </p>
      </div>

      {expandedPresent && (
        <div
          ref={modalRef}
          className={`program-modal opacity-0${expanded ? "" : " pointer-events-none"}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="expanded-program-title"
        >
          <div className="program-modal__bar">
            <div>
              <p>ALPS 2026</p>
              <h2 id="expanded-program-title">Scientific program</h2>
            </div>
            <button ref={closeButtonRef} type="button" onClick={() => setExpanded(false)} aria-label="Close full screen program">
              <X className="h-5 w-5" aria-hidden />
              Close
            </button>
          </div>
          <div ref={modalContentRef} className="program-modal__content opacity-0">
            <ProgramSchedule expanded onSpeakerOpen={handleSpeakerOpen} onExperienceOpen={handleExperienceOpen} />
          </div>
        </div>
      )}
    </section>
  );
}
