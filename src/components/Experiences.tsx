import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import {
  EXPERIENCE_MODAL_EVENT,
  getExperienceModalId,
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
    title: "Art Exhibition",
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
              "At ALPS he will exhibit a selection of blotter pieces and collages. Come look closely. The whole point is the micro/macro jump: a minute image on a scrap of paper, and the journey it implies.",
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
        context: "Sound healer · Switzerland",
        image: "marina-vovk.jpg",
        imagePosition: "50% 22%",
        gallery: [
          "marina-vovk-2.jpg",
          "marina-vovk-3.jpg",
          "marina-vovk-4.jpg",
          "marina-vovk-5.jpg",
          "marina-vovk-6.jpg",
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
        name: "Dave Elmiger",
        role: "Sound",
        context: "Musician",
        sessions: [
          {
            title: "Sound",
            description: "Dave Elmiger joins the sound programme at ALPS 2026. Further details will be published here soon.",
          },
        ],
      },
    ],
  },
  {
    id: "more",
    title: "More",
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
              "Open-mic, sign up on the night. Five minutes. No rehearsal. Share the weird, the tricky or the wonderful. The best ones are usually told off the cuff. A room that has already warmed up is a much kinder place to tell a story than a cold lecture hall.",
          },
        ],
        bio: "Kate is an event coordinator at the Psychedelic Society UK. She also works in neuroaesthetics at Kinda Studios and with Onaya Science on ritual, music and plant medicines. Most people come to her nights alone. That’s the point.",
      },
      {
        name: "Andrea Bacconi",
        role: "Yoga",
        context: "Yoga",
        sessions: [
          {
            title: "Yoga",
            description: "Andrea Bacconi will offer yoga during the conference. Further details will be published here soon.",
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
      { time: "11:35–12:00", title: "Yoga", personName: "Andrea Bacconi" },
      { time: "13:40–14:25 & 16:30–17:15", title: "Sound meditation", personName: "Marina Vovk" },
      { time: "13:45–14:30", title: "Speed-friending", detail: "Second half of lunch", personName: "Kate Dalby" },
      { time: "18:40–19:20", title: "Sound", personName: "Dave Elmiger" },
      { time: "21:00–22:00", title: "Psychedelic storytelling", personName: "Kate Dalby" },
    ],
  },
  {
    day: "Saturday",
    date: "10 October",
    dateTime: "2026-10-10",
    items: [
      { time: "All day", title: "Art exhibition", detail: "LSD blotter art & live painting", kind: "allday", personNames: ["Kevin Barron", "Hannah Stanke"] },
      { time: "08:10–08:50 & 18:10–18:50", title: "Sound", personName: "Dave Elmiger" },
      { time: "11:05–11:30", title: "Yoga", personName: "Andrea Bacconi" },
      { time: "12:30–14:00", title: "Live music", detail: "During lunch", personName: "Dave Elmiger" },
      { time: "13:10–13:55 & 16:10–16:55", title: "Sound meditation", personName: "Marina Vovk" },
      { time: "13:15–14:00", title: "Speed-friending", detail: "Second half of lunch", personName: "Kate Dalby" },
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
  onClose,
}: {
  person: ExperiencePerson;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const photos = person.image ? [person.image, ...(person.gallery ?? [])] : [];
  const [activePhoto, setActivePhoto] = useState(person.image ?? "");
  const headingId = `experience-${person.name.replace(/\s+/g, "-").toLowerCase()}`;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (overlayRef.current && cardRef.current) {
      if (reducedMotion) {
        overlayRef.current.style.opacity = "1";
        cardRef.current.style.opacity = "1";
      } else {
        animate(overlayRef.current, { opacity: [0, 1], duration: 220, easing: "linear" });
        animate(cardRef.current, {
          opacity: [0, 1],
          translateY: [18, 0],
          scale: [0.97, 1],
          duration: 440,
          easing: "easeOutCubic",
        });
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 opacity-0"
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
              {person.context ? `${person.role} · ${person.context}` : person.role}
            </p>
            <h3 id={headingId} className="text-xl font-semibold text-white">
              {person.name}
            </h3>
          </div>
        </div>

        {photos.length > 1 && (
          <div className="mb-6">
            <div className="overflow-hidden rounded-[1rem] border border-white/10 aspect-[16/10] bg-white/[0.03] mb-3">
              <img
                src={withBase(`img/experiences/${activePhoto}`)}
                alt=""
                className="w-full h-full object-cover"
                style={{ objectPosition: person.imagePosition ?? "50% 30%" }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setActivePhoto(photo)}
                  aria-label={`View photo ${index + 1} of ${photos.length}`}
                  aria-pressed={activePhoto === photo}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-md border transition-colors cursor-pointer ${
                    activePhoto === photo
                      ? "border-accent-light"
                      : "border-white/10 hover:border-accent/50"
                  }`}
                >
                  <img
                    src={withBase(`img/experiences/${photo}`)}
                    alt=""
                    className="h-full w-full object-cover"
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
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    }
  };

  return (
    <>
      <div
        id={experienceModalId}
        className="group relative flex flex-col bg-white/[0.03] border border-white/[0.07] rounded-[1.15rem] overflow-hidden hover:border-accent/35 hover:bg-white/[0.05] transition-all duration-300"
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
          <button
            type="button"
            onClick={() => openExperienceModal(person.name)}
            className="mt-auto text-[0.68rem] sm:text-xs font-medium text-accent-light hover:text-white transition-colors uppercase tracking-[0.12em] cursor-pointer text-left"
          >
            Read more →
          </button>
        </div>
      </div>
      {modalOpen && <ExperienceModal person={person} onClose={closeModal} />}
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
    <div className="program-board experiences-board">
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
