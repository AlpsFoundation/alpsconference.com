import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import {
  EXPERIENCE_MODAL_EVENT,
  getExperienceModalId,
  openExperienceModal,
} from "../lib/experienceModal";
import Afterparty from "./Afterparty";
import { EXPERIENCE_DAYS } from "../data/experiences";

type ExperienceSession = {
  title: string;
  description: string;
};

type ExperienceLinks = {
  website?: string;
  instagram?: string;
};

type ExperienceArtist = {
  name: string;
  image?: string;
  imagePosition?: string;
  sessions?: ExperienceSession[];
  bio?: string;
  links?: ExperienceLinks;
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
  links?: ExperienceLinks;
  /** Other names (individual artists behind a shared card) that also open this modal. */
  aliases?: string[];
  /** Individual profiles shown inside a shared card's modal, each with their own photo. */
  artists?: ExperienceArtist[];
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
    summary: "LSD blotter art, live painting, and Uncanny World, throughout both days.",
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
        links: {
          website: "https://kbarron.co.uk",
          instagram: "eleusisblotter",
        },
      },
      {
        name: "Art Corner",
        role: "Exhibition & live painting",
        eyebrow: "Exhibition & live painting",
        aliases: ["Joanne Lackey", "Hannah Stanke"],
        artists: [
          {
            name: "Hannah Stanke",
            image: "hannah-stanke.jpg",
            imagePosition: "42% 28%",
            sessions: [
              {
                title: "Live painting",
                description:
                  "Hannah will exhibit work in the Foyer Art Corner, with pieces available for purchase. She will live-paint both days; finished works may be purchased by visitors.",
              },
            ],
            bio: "Hannah Stanke is a visual artist who expresses her inner world and philosophy through paint. Her art is inspired by her inner cosmos and the human experience. She likes to visually express her emotions and inner world with elements she connects to such as botany, airy and moving elements like clouds and energies, micro and natural patterns.",
            links: {
              instagram: "chuvatti",
            },
          },
          {
            name: "Joanne Lackey",
            image: "joanne-lackey.jpg",
            imagePosition: "50% 6%",
            sessions: [
              {
                title: "Exhibition & live painting",
                description:
                  "Joanne Lackey will exhibit a selection of her work in the Foyer Art Corner and may also be live-painting during the event.",
              },
            ],
            bio: "Joanne Lackey is a multidisciplinary visual artist working across painting, drawing, digital art and sculpture. Flowing freely between acrylics, watercolour, gouache, pastels and other mediums, she lets each material become a different way of expressing an idea, feeling or experience.\n\nHer work is inspired by nature, movement, geometry, energy and the shifting nature of perception. Psychedelic experiences, self-discovery and the exploration of consciousness also influence her visual language, creating colourful and multilayered worlds where the seen and unseen meet.",
            links: {
              instagram: "joltherixo_art",
            },
          },
        ],
      },
      {
        name: "Régis Paroz",
        role: "Uncanny World",
        context: "Artist · Switzerland",
        image: "regis-paroz.jpg",
        imagePosition: "54% 16%",
        sessions: [
          {
            title: "Uncanny World",
            description:
              "This collection questions the nature and the reality of the strange objects it depicts. These are of course images generated by artificial intelligences, and everything in them is false — but it is likely that these intelligences will in time generate a great deal more than images: knowledge of the most distant worlds, objects with extraordinary powers, beings of a new kind. What is possible and what is not has never been more uncertain, and the excitement — or the unease — is real. What are the limits of these neural networks that tamper with the possible, and how are we to stay sane in a world moving at this speed? A collection of images that provokes, anticipates, turns ironic and perhaps poetic, and that, like psychedelics, seeks to connect us to this decidedly strange world that houses us.",
          },
        ],
        bio: "Régis Paroz is a Swiss artist from the Lavaux region near Lausanne. Trained as an architect, he later became an entrepreneur working with CNC machines and now teaches 3D polydesign and decoration. His practice draws on a longstanding interest in psychology, mythology, spirituality, and psychedelics. Inspired by visionary architecture, 1960s psychedelia, art brut, and comics, he explores how art reveals the psyche, its archetypes, and the ways imagination shapes our understanding of reality.",
      },
    ],
  },
  {
    id: "sound",
    title: "Meditation",
    summary: "Sound meditations, breathwork, and music.",
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
        links: {
          instagram: "marevovk",
        },
      },
      {
        name: "David & Anna-Lea Wennberg",
        role: "Live Concert",
        context: "Musicians",
        image: "david-anna-lea-wennberg.jpg",
        gallery: ["david-anna-lea-wennberg-2.jpg"],
        sessions: [
          {
            title: "Live Concert",
            description: "David & Anna-Lea Wennberg will play a live concert during Saturday lunch. Further details will be published here soon.",
          },
        ],
      },
      {
        name: "Pascal Kälin",
        role: "Breathwork",
        context: "Switzerland",
        image: "pascal-kalin.jpg",
        imagePosition: "50% 24%",
        sessions: [
          {
            title: "Breathwork Journey",
            description:
              "Pascal offers you a guided breathwork journey as a space to slow down, reconnect with your body and turn inward.\n\nThrough conscious connected breathing, you are invited to meet what is present within you – physically, emotionally and mentally. The breath can open a space for release, clarity, inner connection and a deeper sense of presence.\n\nThe session is an invitation to step out of your mind for a moment, listen to your body and allow the breath to guide the way inward.",
          },
        ],
        bio: "Pascal Kälin is a Swiss breathwork facilitator and founder of Secrets of Alchemy. His work is centered around the breath, body awareness, inner processes and a deeper connection to oneself.\n\nAt the heart of his work is a simple idea: the breath is already within us. Rather than giving people something from the outside, his work invites them to explore what may already be waiting to be discovered.",
      },
    ],
  },
  {
    id: "more",
    title: "…and more",
    summary: "Connection, storytelling, movement, and the Saturday afterparty.",
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
        image: "andrea-bacconi.jpg",
        sessions: [
          {
            title: "Yoga and embodiment",
            description:
              "During the conference, her yoga session offers a chance to step out of sitting and thinking and come back into the body. Through slow movement and gentle stretching, participants can let go of the stiffness and stress, give the nervous system time to settle, and return to the programme at a calmer pace.\n\nHer approach is slow and unhurried, with more attention on how a movement feels than on how it looks. No previous experience is needed, and nothing in the practice is demanding. She guides participants towards their own sensations, so they can notice what it is like to be fully present in their body while they move, and follow what they need on the day.\n\nFor the conference, Andrea will offer a quiet session of gentle movement, breath, and embodiment, designed as a space to release tension, regulate, and arrive back in the body.",
          },
        ],
        bio: "Andrea is a yoga teacher and somatic coach. She works with people who want to reconnect with their bodies and learn to listen to what the body already knows. She is a certified InnerLifeSkills master coach and trained as a somatic educator with the Somatic Institute for Women. Alongside her one-to-one practice she runs embodiment workshops and women's circles, with a growing focus on guiding women to reclaim sovereignty over their own bodies.",
      },
    ],
  },
];

function getPersonSessionTimes(name: string) {
  return EXPERIENCE_DAYS.flatMap((day) =>
    day.items
      .filter((item) => {
        if (item.kind === "allday") return false;
        const names = item.credits?.map((credit) => credit.name) ?? item.personNames ?? (item.personName ? [item.personName] : []);
        return names.includes(name);
      })
      .map((item) => ({
        day: day.day,
        time: item.time,
        title: item.title,
      }))
  );
}

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

function ExperienceLinkButtons({ links }: { links: ExperienceLinks }) {
  const items: { href: string; label: string; icon: ReactNode }[] = [];

  if (links.website) {
    items.push({
      href: links.website,
      label: links.website.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </>
      ),
    });
  }

  if (links.instagram) {
    items.push({
      href: `https://www.instagram.com/${links.instagram}/`,
      label: `@${links.instagram}`,
      icon: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </>
      ),
    });
  }

  if (items.length === 0) return null;

  return (
    <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2.5">
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:border-accent/40 hover:bg-white/[0.06] transition-colors"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {item.icon}
          </svg>
          {item.label}
        </a>
      ))}
    </div>
  );
}

type ModalPhoto = { file: string; position: string };

function collectModalPhotos(person: ExperiencePerson): ModalPhoto[] {
  if (person.artists?.length) {
    return person.artists.flatMap((artist) =>
      artist.image ? [{ file: artist.image, position: artist.imagePosition ?? "50% 30%" }] : []
    );
  }
  if (!person.image) return [];
  return [person.image, ...(person.gallery ?? [])].map((file) => ({
    file,
    position: person.imagePosition ?? "50% 30%",
  }));
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
  const photos = collectModalPhotos(person);
  const [activeIndex, setActiveIndex] = useState(0);
  const activePhoto = photos[activeIndex];
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
          {!person.artists?.length && activePhoto && (
            <ModalPhoto
              src={withBase(`img/experiences/${activePhoto.file}`)}
              alt={person.name}
              position={activePhoto.position}
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

        {!person.artists?.length && photos.length > 1 && (
          <div className="mb-6 flex items-start justify-center gap-2 sm:gap-3">
            <img
              src={withBase(`img/experiences/${activePhoto.file}`)}
              alt=""
              className="max-h-[min(32rem,55vh)] w-auto max-w-[calc(100%-3.25rem)] rounded-[1rem] border border-white/10 object-contain"
            />
            <div className="flex max-h-[min(32rem,55vh)] w-11 shrink-0 flex-col gap-1.5 overflow-y-auto sm:w-12">
              {photos.map((photo, index) => (
                <button
                  key={photo.file}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`View photo ${index + 1} of ${photos.length}`}
                  aria-pressed={activeIndex === index}
                  className={`relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md border bg-white/[0.03] transition-colors cursor-pointer ${
                    activeIndex === index
                      ? "border-accent-light"
                      : "border-white/10 hover:border-accent/50"
                  }`}
                >
                  <img
                    src={withBase(`img/experiences/${photo.file}`)}
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

        {person.artists && person.artists.length > 0 && (
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {person.artists.map((artist) => (
              <div
                key={artist.name}
                className="flex flex-col border-t border-white/10 pt-5 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0"
              >
                {artist.image && (
                  <img
                    src={withBase(`img/experiences/${artist.image}`)}
                    alt={artist.name}
                    className="mb-4 aspect-[4/5] max-h-[40vh] w-full rounded-[1rem] border border-white/10 object-cover sm:max-h-none"
                    style={{ objectPosition: artist.imagePosition ?? "50% 30%" }}
                  />
                )}
                <h4 className="text-lg font-semibold text-white mb-4">{artist.name}</h4>
                <div className="space-y-5">
                  {artist.sessions?.map((session) => (
                    <div key={session.title}>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light/80 mb-2">
                        {session.title}
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                        {session.description}
                      </p>
                    </div>
                  ))}
                  {artist.bio && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-light/80 mb-2">
                        Biography
                      </p>
                      <p className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{artist.bio}</p>
                    </div>
                  )}
                </div>
                {artist.links && (
                  <div className="mt-auto">
                    <ExperienceLinkButtons links={artist.links} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {person.links && <ExperienceLinkButtons links={person.links} />}
      </div>
    </div>,
    document.body
  );
}

function ExperienceCard({ person }: { person: ExperiencePerson }) {
  const [modalOpen, setModalOpen] = useState(false);
  const { present: modalPresent, onExited } = useModalPresence(modalOpen);
  // A shared card (e.g. the Art Corner) also answers to each artist's own modal id,
  // so credit links in the programme still resolve.
  const modalIdKey = [person.name, ...(person.aliases ?? [])].map(getExperienceModalId).join("|");
  // Two-photo experiences (two artists, a duo) split the thumbnail into stacked halves.
  const cardPhotos = collectModalPhotos(person);
  const sessions = getPersonSessionTimes(person.name);
  const showSessionTitles = new Set(sessions.map((session) => session.title)).size > 1;

  useEffect(() => {
    const modalIds = modalIdKey.split("|");
    const syncFromHash = () => setModalOpen(modalIds.includes(window.location.hash.slice(1)));
    const handleOpen = (event: Event) => {
      const { experienceId } = (event as CustomEvent<{ experienceId: string }>).detail;
      setModalOpen(modalIds.includes(experienceId));
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener(EXPERIENCE_MODAL_EVENT, handleOpen);
    };
  }, [modalIdKey]);

  const closeModal = () => {
    setModalOpen(false);
    if (modalIdKey.split("|").includes(window.location.hash.slice(1))) {
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
          {cardPhotos.length === 2 ? (
            <div className="flex h-full w-full flex-col gap-px">
              {cardPhotos.map((photo) => (
                <div key={photo.file} className="relative h-1/2 w-full overflow-hidden">
                  <ExperiencePhoto
                    src={withBase(`img/experiences/${photo.file}`)}
                    alt={person.name}
                    initials={initials(person.name)}
                    position="50% 50%"
                  />
                </div>
              ))}
            </div>
          ) : cardPhotos.length > 0 ? (
            <ExperiencePhoto
              src={withBase(`img/experiences/${cardPhotos[0].file}`)}
              alt={person.name}
              initials={initials(person.name)}
              position={cardPhotos[0].position}
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
          <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">{person.name}</h4>
          {sessions.length > 0 && (
            <ul className="mt-auto pt-3 space-y-1">
              {sessions.map((session) => (
                <li
                  key={`${session.day}-${session.time}-${session.title}`}
                  className="text-[0.68rem] sm:text-xs text-white/55 leading-snug"
                >
                  <span className="text-accent-light/90">{session.day.slice(0, 3)}</span>
                  <span className="text-white/25"> · </span>
                  {session.time}
                  {showSessionTitles && (
                    <>
                      <span className="text-white/25"> · </span>
                      {session.title}
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </button>
      {modalPresent && (
        <ExperienceModal person={person} open={modalOpen} onClose={closeModal} onExited={onExited} />
      )}
    </>
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

        <div className="space-y-10 sm:space-y-14">
          {EXPERIENCES.map((category) => (
            <div
              key={category.id}
              data-fade-up
              className="opacity-0 grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4"
            >
              <div className="col-span-2 md:col-span-1 md:sticky md:top-24 md:self-start">
                <h3 className="text-white font-semibold tracking-tight text-[1.85rem] sm:text-[2.15rem] leading-none">
                  {category.title}
                </h3>
                <p className="mt-3 text-white/55 text-sm leading-relaxed max-w-xs">{category.summary}</p>
              </div>
              {category.people.map((person) => (
                <ExperienceCard key={person.name} person={person} />
              ))}
              {category.id === "more" && <Afterparty />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
