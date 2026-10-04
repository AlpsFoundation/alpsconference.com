import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { BookOpen, Download, FileText } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { withBase } from "../lib/withBase";
import { POSTERS, type ResearchPoster } from "../data/researchPosters";

function useScrollFade(ref: React.RefObject<HTMLElement | null>) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [24, 0],
            delay: (_: unknown, i: number) => i * 85,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function PosterPreview({ poster }: { poster: ResearchPoster }) {
  if (poster.hasPdf) {
    return (
      <img
        src={withBase(`research-posters/${poster.slug}/poster.jpg`)}
        alt={`First page of the research poster “${poster.title}”`}
        loading="lazy"
        className="h-full w-full object-cover object-top"
      />
    );
  }
  // Stand-in until the PDF arrives: an A0 sheet with the title on it.
  return (
    <div className="flex h-full w-full flex-col justify-between bg-gradient-to-b from-support/25 via-white/[0.04] to-accent/15 p-4">
      <div className="space-y-2">
        <div className="h-1.5 w-10 rounded-full bg-support-light/60" />
        <p className="text-xs font-semibold leading-snug text-white/85">{poster.title}</p>
      </div>
      <div className="grid grid-cols-2 gap-2 opacity-40">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-8 rounded-sm bg-white/15" />
        ))}
      </div>
      <p className="text-[0.65rem] uppercase tracking-[0.16em] text-white/40">PDF coming soon</p>
    </div>
  );
}

function Summary({ paragraphs }: { paragraphs: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6">
      <div className={`space-y-3 text-base leading-relaxed text-white/65 ${open ? "" : "line-clamp-4"}`}>
        {(open ? paragraphs : paragraphs.slice(0, 1)).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="mt-2 text-sm font-semibold text-support-light transition-colors hover:text-white"
      >
        {open ? "Show less" : "Read more"}
      </button>
    </div>
  );
}

function PosterCard({ poster }: { poster: ResearchPoster }) {
  const pdfHref = withBase(`research-posters/${poster.slug}/poster.pdf`);

  return (
    <article
      data-fade-up
      className="opacity-0 flex flex-col sm:flex-row overflow-hidden rounded-sm border border-white/[0.08] bg-white/[0.03]"
    >
      {poster.hasPdf ? (
        <a
          href={pdfHref}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-[841/1189] mx-5 mt-5 w-1/2 shrink-0 self-start overflow-hidden rounded-sm border border-white/[0.08] sm:m-0 sm:rounded-none sm:border-0 bg-white/[0.02] transition-opacity hover:opacity-90 sm:w-48 sm:border-r"
        >
          <PosterPreview poster={poster} />
        </a>
      ) : (
        <div className="aspect-[841/1189] mx-5 mt-5 w-1/2 shrink-0 self-start overflow-hidden rounded-sm border border-white/[0.08] sm:m-0 sm:rounded-none sm:border-0 sm:w-48 sm:border-r">
          <PosterPreview poster={poster} />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="mb-5 text-lg font-semibold leading-snug text-white">{poster.title}</h3>

        <div className="mb-5 flex items-center gap-4">
          {poster.hasPhoto ? (
            <img
              src={withBase(`research-posters/${poster.slug}/photo.jpg`)}
              alt={poster.name}
              loading="lazy"
              className="h-16 w-16 shrink-0 rounded-full border border-white/10 object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/10 bg-support/20 text-lg font-semibold text-support-light">
              {initials(poster.name)}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{poster.name}</p>
            {poster.credentials && <p className="text-sm text-support-light">{poster.credentials}</p>}
            <p className="text-sm text-white/55">{poster.affiliation}</p>
          </div>
        </div>

        {poster.summary && <Summary paragraphs={poster.summary} />}

        <div className="mt-auto">
          {poster.hasPdf ? (
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-support px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-support-light"
            >
              <Download className="h-4 w-4" />
              View research poster (PDF)
            </a>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-5 py-3 text-sm font-semibold text-white/40">
              <FileText className="h-4 w-4" />
              Research poster coming soon
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ResearchPostersPage() {
  const heroRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLElement>(null);

  useScrollFade(heroRef);
  useScrollFade(gridRef);

  return (
    <>
      <Navbar />

      <main>
        <section ref={heroRef} className="relative pt-40 pb-16 sm:pt-48 sm:pb-20 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p data-fade-up className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4">
              ALPS Conference 2026
            </p>
            <h1 data-fade-up className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              Research Posters
            </h1>
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Meet the researchers presenting their work in psychedelic science at the conference, 9–10 October
              2026 in Aarau. Find them by their research posters during the breaks, or read them in full here.
            </p>
            <a
              data-fade-up
              href={withBase("/research-posters/guidelines")}
              className="opacity-0 mt-10 inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-white/5 hover:bg-white/[0.08] border border-white/10 hover:border-white/25 rounded-sm transition-colors duration-200"
            >
              <BookOpen className="h-4 w-4" />
              Guidelines for presenters
            </a>
          </div>
        </section>

        <section ref={gridRef} className="relative pb-24 sm:pb-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {POSTERS.map((poster) => (
                <PosterCard key={poster.slug} poster={poster} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Footer />
      </div>
    </>
  );
}
