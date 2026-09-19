import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import { setLocationHash } from "../lib/locationHash";
import { useModalMotion, useModalPresence } from "../lib/modalAnimation";
import { focusWithoutScroll, lockBodyScroll, unlockBodyScroll } from "../lib/scrollLock";
import { registerPhotoParallax } from "../lib/photoParallax";
import {
  EXPERIENCE_MODAL_EVENT,
  getExperienceModalId,
  openExperienceModal,
} from "../lib/experienceModal";
import Afterparty from "./Afterparty";
import { EXPERIENCE_DAYS } from "../data/experiences";
import {
  EXPERIENCES,
  type ExperienceArtist,
  type ExperienceLinks,
  type ExperiencePerson,
} from "../data/experienceProfiles";


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
  const photoRef = useRef<HTMLImageElement>(null);

  useEffect(() => registerPhotoParallax(photoRef.current), [errored]);

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
      ref={photoRef}
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
          {!person.artists?.length && !person.photoLayout && activePhoto && (
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

        {!person.artists?.length && photos.length > 1 && person.photoLayout === "grid" && (
          <div className="mb-7 grid gap-3 sm:grid-cols-2">
            {photos.map((photo) => (
              <img
                key={photo.file}
                src={withBase(`img/experiences/${photo.file}`)}
                alt=""
                className="aspect-[4/5] w-full rounded-[1rem] border border-white/10 object-cover"
                style={{ objectPosition: photo.position }}
              />
            ))}
          </div>
        )}

        {!person.artists?.length && photos.length > 1 && !person.photoLayout && (
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
        <div className="aspect-square overflow-hidden bg-white/[0.03] relative">
          {cardPhotos.length === 2 ? (
            <div className="flex h-full w-full gap-px">
              {cardPhotos.map((photo) => (
                <div key={photo.file} className="relative h-full w-1/2 overflow-hidden">
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
          <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">
            {person.cardTitle ?? person.name}
          </h4>
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
