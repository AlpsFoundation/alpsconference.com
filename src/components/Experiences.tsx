import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import {
  EXPERIENCE_MODAL_EVENT,
  EXPERIENCES_SCHEDULE_ID,
  getExperienceModalId,
  getExperienceSlotId,
  openExperienceModal,
} from "../lib/experienceModal";

type ExperienceSession = {
  title: string;
  description: string;
};

type ExperiencePerson = {
  name: string;
  role: string;
  context?: string;
  eyebrow?: string;
  image?: string;
  imagePosition?: string;
  gallery?: string[];
  sessions?: ExperienceSession[];
  bio?: string;
};

type ExperienceCategory = {
  id: "art" | "sound" | "more";
  title: string;
  summary: string;
  people: ExperiencePerson[];
};

const EXPERIENCES: ExperienceCategory[] = [
  {
    id: "art",
    title: "Art",
    summary: "LSD blotter art and live painting, throughout both days.",
    people: [
      {
        name: "Kevin Barron",
        role: "LSD blotter art",
        context: "Artist",
        image: "kevin-barron.jpg",
        imagePosition: "50% 12%",
        sessions: [
          {
            title: "LSD blotter exhibition",
            description:
              "At ALPS he will exhibit a selection of blotter pieces. Come look closely. The whole point is the micro/macro jump: a minute image on a scrap of paper, and the journey it implies.",
          },
        ],
        bio: "British blotter artist Kevin Barron has been making psychedelic images for nearly six decades. After art school in the late 1960s he stepped sideways into music (Cat Stevens, a Rolling Stones tour) and then back into the tiny square of paper that he still treats as the highest form of psychedelic art: a picture you can look at, and that can also take you somewhere.\n\nHis 1990s “Shield” blotter, co-signed by Albert Hofmann and Timothy Leary, is the piece collectors call the holy grail of blotter art. Originals of his work are scarce; he has shown in London, Paris, Ibiza and the US. His book BLOTTO: Adventures and Misadventures in Psychedelia came out in 2024.",
      },
      {
        name: "Hannah Stanke",
        role: "Live painting",
        context: "Artist",
        image: "hannah-stanke.jpg",
        imagePosition: "42% 28%",
        sessions: [
          {
            title: "Live painting",
            description:
              "Hannah Stanke will be live-painting throughout the conference, in the same space as the blotter exhibition. Further details will be published here soon.",
          },
        ],
      },
    ],
  },
  {
    id: "sound",
    title: "Sound",
    summary: "Sound meditations and music between the talks.",
    people: [
      {
        name: "Marina Vovk",
        role: "Sound meditations",
        eyebrow: "Sound Meditations",
        context: "Sound healer · Switzerland",
        image: "marina-vovk.jpg",
        imagePosition: "50% 22%",
        gallery: [
          "marina-vovk-2.jpg",
          "marina-vovk-3.jpg",
          "marina-vovk-4.jpg",
          "marina-vovk-6.jpg",
          "marina-vovk-7.jpg",
        ],
        sessions: [
          {
            title: "Sound meditation",
            description:
              "During the conference, her sound-healing session offers an opportunity to pause, release accumulated tension, and give the mind and body space to process and integrate the information and experiences of the day. By creating a moment of rest between talks, discussions, and other activities, the session can help participants restore their attention, regulate their pace, and return to the conference with greater clarity and openness.\n\nHer approach is intuitive yet grounded: she listens closely to the group and adapts each session to the people and space in the room. Rather than directing a particular experience, she creates a supportive environment where participants can rest, reconnect with themselves, and allow their own experience to unfold.\n\nFor the conference, Marina will offer an immersive sound-healing session designed as a space for relaxation, embodiment, integration, and renewed presence.",
          },
        ],
        bio: "Marina Vovk is a Ukrainian sound healer and gong practitioner, psychologist and psyche-aroma diagnostician. She is also a certified yoga instructor, meditation guide, and Reiki and Qigong practitioner, with over sixteen years of dedicated practice.\n\nBased in Switzerland since 2022, Marina works at the intersection of sound, psychology, embodiment, contemplative practices, and psychedelic-assisted approaches. She is trained in MAPS Psychedelic-Assisted Therapy for PTSD and supports MAPS educational programs internationally, including in Ukraine, Poland and Switzerland.\n\nThrough immersive sound journeys with gongs, singing bowls, and other acoustic instruments, Marina creates spaces for deep relaxation, grounding, and reconnection with the body. Her work invites participants to slow down, shift their attention from the intellectual to the embodied, and reconnect with a sense of presence.",
      },
      {
        name: "David Elmiger & Friends",
        role: "Live Concert",
        context: "Musicians",
        sessions: [
          {
            title: "Live Concert",
            description: "David Elmiger & Friends will play a live concert during Saturday lunch. Further details will be published here soon.",
          },
        ],
      },
    ],
  },
  {
    id: "more",
    title: "…and more",
    summary: "Connection, storytelling, and movement.",
    people: [
      {
        name: "Kate Dalby",
        role: "Speed-friending & storytelling",
        context: "Psychedelic Society UK",
        image: "kate-dalby.jpg",
        imagePosition: "50% 22%",
        sessions: [
          {
            title: "Speed-friending",
            description:
              "Drop the small talk. Kate runs a menu of questions inspired by the 36 Questions to Intimacy and The School of Life’s 100 Questions — some gentle, some spicy — then walks you through short icebreakers and a series of 7–10 minute one-to-ones with different people. It is not networking. You leave with a few real conversations and, if you’re lucky, the start of something.",
          },
          {
            title: "Psychedelic storytelling",
            description:
              "End the first conference day with an evening of authentic connection and community. After a full day of talks, Kate holds an open-mic storytelling circle — a space to integrate through the simple, powerful act of sharing. Sign up on the night. Five minutes. No rehearsal. Share something from the journey: the weird, the tricky, or the wonderful. There is no need to prepare; the best stories are often told off the cuff and from the heart. Come share, listen, and connect.",
          },
        ],
        bio: "Kate Dalby (she/her) is a creative neuroscientist exploring how spaces and sensory environments shape our inner world. Her background spans clinical sleep studies, altered states of consciousness, and personalised gene therapies. Now her primary works is at Neuroaesthetics studio and lab, Kinda Studios. While her ongoing work with Onaya Science explores how ritual, music, and plant medicines support trauma recovery — a curiosity that flows into her wider passion for gathering people in community through The Psychedelic Society.",
      },
      {
        name: "Andrea Bacconi",
        role: "Yoga",
        context: "Yoga",
        sessions: [
          {
            title: "Yoga",
            description: "Andrea Bacconi will offer yoga on Saturday morning. Further details will be published here soon.",
          },
        ],
      },
    ],
  },
];

type ExperienceSlot = {
  time: string;
  title: string;
  detail?: string;
  kind?: "allday" | "session";
  personName?: string;
  personNames?: string[];
};

type ExperienceDay = {
  day: string;
  date: string;
  dateTime: string;
  items: ExperienceSlot[];
};

const EXPERIENCE_DAYS: ExperienceDay[] = [
  {
    day: "Friday",
    date: "9 October",
    dateTime: "2026-10-09",
    items: [
      { time: "All day", title: "Art exhibition", detail: "LSD blotter art & live painting", kind: "allday", personNames: ["Kevin Barron", "Hannah Stanke"] },
      { time: "13:40–14:25 & 16:30–17:15", title: "Sound meditation", personName: "Marina Vovk" },
      { time: "13:45–14:30", title: "Speed-friending", detail: "Second half of lunch", personName: "Kate Dalby" },
      { time: "20:00–21:30", title: "TBA" },
      { time: "21:00–22:00", title: "Psychedelic storytelling", personName: "Kate Dalby" },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      { time: "All day", title: "Art exhibition", detail: "LSD blotter art & live painting", kind: "allday", personNames: ["Kevin Barron", "Hannah Stanke"] },
      { time: "08:10–08:50", title: "Yoga", personName: "Andrea Bacconi" },
      { time: "12:30–14:00", title: "Live Concert", detail: "During lunch", personName: "David Elmiger & Friends" },
      { time: "13:10–13:55 & 16:10–16:55", title: "Sound meditation", personName: "Marina Vovk" },
    ],
  },
];

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function ExperiencePhoto({
  src,
  alt,
  initials: init,
  position,
}: {
  src: string;
  alt: string;
  initials: string;
  position: string;
}) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <span className="text-xl text-accent-light font-bold">{init}</span>
        </div>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-focus-within:grayscale-0 group-hover:scale-[1.025] transition-[filter,scale] duration-700 ease-out"
      style={{ objectPosition: position }}
      onError={() => setErrored(true)}
    />
  );
}

function ModalPhoto({ src, alt, position }: { src: string; alt: string; position: string }) {
  const [errored, setErrored] = useState(false);
  if (errored) return null;
  return (
    <div className="w-16 h-16 rounded-full shrink-0 overflow-hidden border border-white/10">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ objectPosition: position }}
        onError={() => setErrored(true)}
      />
    </div>
  );
}

function ExperienceModal({
  person,
  open,
  onClose,
  onExited,
}: {
  person: ExperiencePerson;
  open: boolean;
  onClose: () => void;
  onExited: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const photos = person.image ? [person.image, ...(person.gallery ?? [])] : [];
  const [activePhoto, setActivePhoto] = useState(person.image ?? "");
  const headingId = `${getExperienceModalId(person.name)}-title`;

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

        <div className="flex items-start gap-4 mb-6">
          {activePhoto && (
            <ModalPhoto
              src={withBase(`img/experiences/${activePhoto}`)}
              alt={person.name}
              position={person.imagePosition ?? "50% 30%"}
            />
          )}
          <div>
            <p className="text-sm text-accent-light font-medium tracking-wide uppercase mb-1">
              {person.eyebrow ?? (person.context ? `${person.role} · ${person.context}` : person.role)}
            </p>
            <h3 id={headingId} className="text-xl font-semibold text-white">
              {person.name}
            </h3>
          </div>
        </div>

        {photos.length > 1 && (
          <div className="mb-6 flex items-start justify-center gap-2 sm:gap-3">
            <img
              src={withBase(`img/experiences/${activePhoto}`)}
              alt=""
              className="max-h-[min(32rem,55vh)] w-auto max-w-[calc(100%-3.25rem)] rounded-[1rem] border border-white/10 object-contain"
            />
            <div className="flex max-h-[min(32rem,55vh)] w-11 shrink-0 flex-col gap-1.5 overflow-y-auto sm:w-12">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  aria-label={`View photo ${index + 1} of ${photos.length}`}
                  aria-pressed={activePhoto === photo}
                  className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md border bg-white/[0.03] transition-colors cursor-pointer ${
                    activePhoto === photo
                      ? "border-accent-light"
                      : "border-white/10 hover:border-accent/50"
                  }`}
                >
                  <img
                    src={withBase(`img/experiences/${photo}`)}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-5">
          {person.sessions?.map((session) => (
            <div key={session.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light/80 mb-2">
                {session.title}
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{session.description}</p>
            </div>
          ))}
          {person.bio && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light/80 mb-2">
                Biography
              </p>
              <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{person.bio}</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function ExperienceCard({ person }: { person: ExperiencePerson }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { present: modalPresent, onExited } = useModalPresence(modalOpen);
  const experienceModalId = getExperienceModalId(person.name);

  useEffect(() => {
    const syncFromHash = () => setModalOpen(window.location.hash === `#${experienceModalId}`);
    const handleOpen = (event: Event) => {
      const { experienceId } = (event as CustomEvent<{ experienceId: string }>).detail;
      setModalOpen(experienceId === experienceModalId);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    };
  }, [experienceModalId]);

  const closeModal = () => {
    setModalOpen(false);
    if (window.location.hash === `#${experienceModalId}`) {
      setLocationHash(null, "replace");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => openExperienceModal(person.name)}
        className="group relative flex flex-col w-full text-left bg-white/[0.03] border border-white/[0.07] rounded-[1.15rem] overflow-hidden hover:border-accent/35 hover:bg-white/[0.05] transition-all duration-300 cursor-pointer"
      >
        <div className="aspect-[4/5] overflow-hidden bg-white/[0.03] relative">
          {person.image ? (
            <ExperiencePhoto
              src={withBase(`img/experiences/${person.image}`)}
              alt={person.name}
              initials={initials(person.name)}
              position={person.imagePosition ?? "50% 30%"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                <span className="text-xl text-accent-light font-bold">{initials(person.name)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-3 sm:p-4">
          <p className="text-[0.62rem] sm:text-xs font-medium uppercase tracking-[0.14em] text-accent-light mb-1">
            {person.role}
          </p>
          <h4 className="text-base sm:text-lg font-semibold text-white mb-3 leading-snug">{person.name}</h4>
          <span className="mt-auto text-[0.68rem] sm:text-xs font-medium text-accent-light group-hover:text-white transition-colors uppercase tracking-[0.12em]">
            Read more →
          </span>
        </div>
      </button>
      {modalPresent && (
        <ExperienceModal person={person} open={modalOpen} onClose={closeModal} onExited={onExited} />
      )}
    </>
  );
}

function ScheduleNames({ names }: { names: string[] }) {
  return (
    <span className="experiences-inline-names">
      {names.map((name, index) => (
        <span key={name}>
          {index > 0 && " · "}
          <button type="button" className="experiences-inline-link" onClick={() => openExperienceModal(name)}>
            {name}
          </button>
        </span>
      ))}
    </span>
  );
}

function ExperiencesSchedule() {
  return (
    <div className="program-board experiences-board" id={EXPERIENCES_SCHEDULE_ID}>
      {EXPERIENCE_DAYS.map((day, dayIndex) => (
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
              const names = item.personNames ?? (item.personName ? [item.personName] : []);
              const linked = names.length > 0;
              return (
                <li
                  id={getExperienceSlotId(day.day, item.title)}
                  className={`program-item${item.kind === "allday" ? " program-item--social" : ""}${linked && names.length === 1 ? " program-item--linked" : ""}`}
                  key={`${day.day}-${item.time}-${item.title}`}
                >
                  {linked && names.length === 1 ? (
                    <a
                      className="program-speaker-link"
                      href={`#${getExperienceModalId(names[0])}`}
                      onClick={(event) => {
                        event.preventDefault();
                        openExperienceModal(names[0]);
                      }}
                    >
                      <time>{item.time}</time>
                      <span className="program-speaker-link__copy">
                        <p>{item.title}</p>
                        <span>
                          {names[0]}
                          {item.detail ? ` · ${item.detail}` : ""}
                        </span>
                      </span>
                    </a>
                  ) : (
                    <>
                      <time>{item.time}</time>
                      <div>
                        <p>{item.title}</p>
                        {linked ? (
                          <span>
                            <ScheduleNames names={names} />
                            {item.detail ? ` · ${item.detail}` : ""}
                          </span>
                        ) : (
                          item.detail && <span>{item.detail}</span>
                        )}
                      </div>
                    </>
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

export default function Experiences() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

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
            delay: (_: unknown, i: number) => i * 70,
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

  return (
    <section ref={sectionRef} id="experiences" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 max-w-3xl mb-10 sm:mb-12">
          <p className="section-eyebrow">Beyond the talks</p>
          <h2 className="section-title mb-5">Experiences</h2>
          <p className="text-white/70 text-base sm:text-[1.05rem] leading-relaxed">
            ALPS is about more than science. It is also about art, connection, and the spaces between talks.
            Alongside the scientific programme we offer an exhibition, sound, movement, and social sessions —
            invitations to look closely, listen deeply, and meet one another.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-5 mb-10 sm:mb-12">
          {EXPERIENCES.map((category) => (
            <div key={category.id} data-fade-up className="opacity-0">
              <h3 className="text-white font-semibold tracking-tight text-[1.85rem] sm:text-[2.15rem] leading-none mb-4">
                {category.title}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {category.people.map((person) => (
                  <ExperienceCard key={person.name} person={person} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div data-fade-up className="opacity-0">
          <ExperiencesSchedule />
        </div>
        <p data-fade-up className="opacity-0 mt-5 text-center text-white/50 text-sm">
          Session times subject to change
        </p>
      </div>
    </section>
  );
}
