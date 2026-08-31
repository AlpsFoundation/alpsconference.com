import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Maximize2, Music, PersonStanding, Sparkles, Users, Waves, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getExperienceSlotId } from "../lib/experienceModal";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { getSpeakerModalId, openSpeakerModal } from "../lib/speakerModal";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";

type ProgramExperience = {
  title: string;
  time: string;
};

type ProgramItem = {
  time: string;
  title: string;
  detail?: string;
  kind?: "session" | "pause" | "social";
  speakerName?: string;
  experiences?: ProgramExperience[];
};

const EXPERIENCE_ICONS: Record<string, LucideIcon> = {
  "Sound meditation": Waves,
  "Speed-friending": Users,
  Yoga: PersonStanding,
  "Live Concert": Music,
};

type ProgramDay = {
  day: string;
  date: string;
  dateTime: string;
  items: ProgramItem[];
};

const PROGRAM: ProgramDay[] = [
  {
    day: "Friday",
    date: "9 October",
    dateTime: "2026-10-09",
    items: [
      { time: "08:00–09:00", title: "Doors open", kind: "pause" },
      { time: "09:00–09:30", title: "Opening", detail: "ALPS Team" },
      { time: "09:30–10:30", title: "Dr. Max Wolff", detail: "The Case for Considering Psychedelics as Psychotherapeutic Tools", speakerName: "Dr. Max Wolff" },
      { time: "10:30–11:00", title: "Coffee break", kind: "pause" },
      { time: "11:00–12:00", title: "Morten Lietz", detail: "Do Older Adults Trip Differently? A Double-Blind Comparison of LSD Effects Across the Adult Lifespan", speakerName: "Morten Lietz" },
      { time: "12:00–13:00", title: "Tommaso Barba", detail: "EEG correlates of self-dissolution induced by intranasal 5-MeO-DMT", speakerName: "Tommaso Barba" },
      { time: "13:00–14:30", title: "Lunch break", kind: "pause", experiences: [
        { title: "Sound meditation", time: "13:40–14:25" },
        { title: "Speed-friending", time: "13:45–14:30" },
      ] },
      { time: "14:30–15:30", title: "Manal Al-Hammadi", detail: "Psychedelics Governance: The Category Error in Mental Health Policy", speakerName: "Manal Al-Hammadi" },
      { time: "15:30–16:30", title: "Dr. Sandeep Nayak", detail: "From Data to Dosing Room: Optimizing Psilocybin Therapy for Clinical Practice", speakerName: "Dr. Sandeep Nayak" },
      { time: "16:30–17:15", title: "Coffee break", kind: "pause", experiences: [
        { title: "Sound meditation", time: "16:30–17:15" },
      ] },
      { time: "17:15–18:15", title: "Prof. Amandine Luquiens", detail: "Talk to be announced", speakerName: "Prof. Amandine Luquiens" },
      { time: "18:15–19:15", title: "Panel discussion", detail: "Psychotherapy and psychedelics (TBD)" },
      { time: "19:15–20:00", title: "Optional Networking Dinner", detail: "self-organized", kind: "pause" },
      { time: "20:00–21:30", title: "Friday evening program", kind: "social" },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      { time: "08:00–09:00", title: "Doors open", kind: "pause", experiences: [
        { title: "Yoga", time: "08:10–08:50" },
      ] },
      { time: "09:00–10:00", title: "Dr. Pablo Mallaroni", detail: "Finding order in disorder: mapping the dynamics of the psychedelic brain", speakerName: "Dr. Pablo Mallaroni" },
      { time: "10:00–11:00", title: "Prof. Dr. Eric Vermetten", detail: "What Psychedelics Teach Us About Trauma", speakerName: "Prof. Dr. Eric Vermetten" },
      { time: "11:00–11:30", title: "Break", kind: "pause" },
      { time: "11:30–12:30", title: "Dr. Lydia Belinger", detail: "Serotonin System Stimulation and Social Cognition: Differential Effects of Psilocybin, MDMA, and Methylphenidate", speakerName: "Dr. Lydia Belinger" },
      { time: "12:30–14:00", title: "Lunch break", detail: "Foyer · complimentary", kind: "pause", experiences: [
        { title: "Live Concert", time: "12:30–14:00" },
        { title: "Sound meditation", time: "13:10–13:55" },
      ] },
      { time: "14:00–15:00", title: "Dr. Matthias Forstmann", detail: "The Mushroom Experience Project: Contextual Predictors and Species-Level Variation in the Subjective Effects of Psilocybin Mushrooms", speakerName: "Dr. Matthias Forstmann" },
      { time: "15:00–16:00", title: "Eirini Ketzitzidou Argyri", detail: "Ontological Disruptions and Diversification: Learning from psychedelics", speakerName: "Eirini Ketzitzidou Argyri" },
      { time: "16:00–17:00", title: "Coffee break", detail: "Foyer · complimentary · group picture", kind: "pause", experiences: [
        { title: "Sound meditation", time: "16:10–16:55" },
      ] },
      { time: "17:00–18:00", title: "Dr. Jason K. Day", detail: "What-the-Fuckness: A Phenomenological Concept for Psychedelic Experience", speakerName: "Dr. Jason K. Day" },
      { time: "18:00–19:00", title: "Panel discussion", detail: "Psychedelic and Spirituality (TBD)" },
      { time: "19:00–20:00", title: "Closing talk", detail: "ALPS Team" },
      { time: "20:00–21:30", title: "Networking apéro", kind: "social" },
      { time: "22:00–04:00", title: "Afterparty", kind: "social" },
    ],
  },
];

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
