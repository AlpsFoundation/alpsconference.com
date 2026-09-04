import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Maximize2, Music, PersonStanding, Sparkles, Users, Waves, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PROGRAM, type ProgramExperience } from "../data/program";
import { getExperienceSlotId } from "../lib/experienceModal";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { getSpeakerModalId, openSpeakerModal } from "../lib/speakerModal";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

const EXPERIENCE_ICONS: Record<string, LucideIcon> = {
  "Sound meditation": Waves,
  "Speed-friending": Users,
  Yoga: PersonStanding,
  "Live Concert": Music,
};

function scrollToExperienceSlot(targetId: string) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" });
  el.classList.remove("program-item--flash");
  void el.offsetWidth;
  el.classList.add("program-item--flash");
}

function ProgramExperienceHints({
  day,
  activities,
  onNavigate,
}: {
  day: string;
  activities: ProgramExperience[];
  onNavigate: (targetId: string) => void;
}) {
  return (
    <div className="program-experience-hints">
      {activities.map((activity) => {
        const Icon = EXPERIENCE_ICONS[activity.title] ?? Sparkles;
        const tooltip = `${activity.title} (${activity.time})`;
        return (
          <button
            key={activity.title}
            type="button"
            className="program-experience-hint"
            data-tooltip={tooltip}
            aria-label={`${tooltip}. View in the experiences programme.`}
            onClick={() => onNavigate(getExperienceSlotId(day, activity.title))}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

function ProgramSchedule({
  expanded = false,
  onSpeakerOpen,
  onExperienceNavigate,
}: {
  expanded?: boolean;
  onSpeakerOpen: (speakerName: string) => void;
  onExperienceNavigate: (targetId: string) => void;
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
                  className={`program-item program-item--${item.kind ?? "session"}${item.speakerName ? " program-item--linked" : ""}${experiences.length ? " program-item--has-experience" : ""}`}
                  key={`${day.day}-${item.time}`}
                >
                  {item.speakerName ? (
                    <a
                      className="program-speaker-link"
                      href={`#${getSpeakerModalId(item.speakerName)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        onSpeakerOpen(item.speakerName!);
                      }}
                      aria-label={`View talk details for ${item.title}`}
                    >
                      <time>{item.time}</time>
                      <span className="program-speaker-link__copy">
                        <p>{item.title}</p>
                        {item.detail && <span>{item.detail}</span>}
                      </span>
                    </a>
                  ) : (
                    <>
                      <time>{item.time}</time>
                      <div>
                        <p>{item.title}</p>
                        {item.detail && <span>{item.detail}</span>}
                      </div>
                    </>
                  )}
                  {experiences.length > 0 && (
                    <ProgramExperienceHints
                      day={day.day}
                      activities={experiences}
                      onNavigate={onExperienceNavigate}
                    />
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
  const pendingExperienceNav = useRef<string | null>(null);

  const handleSpeakerOpen = (speakerName: string) => {
    const dispatchOpen = () => openSpeakerModal(speakerName);

    if (expanded) {
      setExpanded(false);
      window.setTimeout(dispatchOpen, 0);
      return;
    }

    dispatchOpen();
  };

  const handleExperienceNavigate = (targetId: string) => {
    if (expanded) {
      pendingExperienceNav.current = targetId;
      setExpanded(false);
      return;
    }

    scrollToExperienceSlot(targetId);
  };

  const handleExpandedExited = () => {
    onExpandedExited();
    const targetId = pendingExperienceNav.current;
    pendingExperienceNav.current = null;
    if (targetId) scrollToExperienceSlot(targetId);
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

  useModalMotion(expanded, modalRef, modalContentRef, handleExpandedExited, {
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
          <ProgramSchedule onSpeakerOpen={handleSpeakerOpen} onExperienceNavigate={handleExperienceNavigate} />
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
            <ProgramSchedule expanded onSpeakerOpen={handleSpeakerOpen} onExperienceNavigate={handleExperienceNavigate} />
          </div>
        </div>
      )}
    </section>
  );
}
