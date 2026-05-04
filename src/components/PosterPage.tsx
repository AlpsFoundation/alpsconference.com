import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Calendar, FileText, CheckCircle, AlertCircle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { withBase } from "../lib/withBase";

const TIMELINE = [
  {
    date: "04 May 2026",
    label: "Application period opens",
    done: true,
  },
  {
    date: "31 August 2026",
    label: "Applications close",
    done: false,
  },
  {
    date: "07 September 2026",
    label: "Last decisions communicated",
    done: false,
  },
  {
    date: "28 September 2026",
    label: "PDF submission of accepted posters",
    done: false,
  },
];

const GUIDELINES = [
  {
    title: "Poster Format",
    icon: FileText,
    items: [
      "Size: A0 portrait (841 × 1189 mm / 33.1 × 46.8 in)",
      "Orientation: Portrait only",
      "File format: PDF (print-ready)",
      "Resolution: 300 DPI minimum",
      "Colour space: RGB",
    ],
  },
  {
    title: "Required Content",
    icon: CheckCircle,
    items: [
      "Title — clear, concise, and descriptive",
      "Author names and institutional affiliations",
      "Introduction / Background",
      "Research objectives or questions",
      "Methods",
      "Results / Findings",
      "Discussion and conclusions",
      "Contact email of the presenting author",
    ],
  },
  {
    title: "Topics & Eligibility",
    icon: AlertCircle,
    items: [
      "Open to researchers at all career stages (students, postdocs, faculty)",
      "Clinical trials and psychedelic-assisted therapy",
      "Neuroscience and pharmacology",
      "Psychology, psychiatry, and mental health",
      "Harm reduction and drug policy",
      "Anthropology, cultural studies, and history",
      "Phenomenology and consciousness research",
      "Ethics, law, and regulatory frameworks",
    ],
  },
];

function TimelineItem({ date, label, index, done }: { date: string; label: string; index: number; done: boolean }) {
  return (
    <div className="relative flex gap-6 pb-10 last:pb-0" data-fade-up style={{ opacity: 0 }}>
      {/* Line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 ${
            done
              ? "bg-support border-support"
              : "bg-transparent border-white/30"
          }`}
        />
        <div className="w-px flex-1 bg-white/10 mt-2" />
      </div>

      <div className="pb-2">
        <p className="text-sm font-medium text-support-light tracking-wide uppercase mb-1">
          {date}
        </p>
        <p className="text-lg text-white/90 font-medium">{label}</p>
      </div>
    </div>
  );
}

function GuidelineCard({
  title,
  icon: Icon,
  items,
}: {
  title: string;
  icon: React.ElementType;
  items: string[];
}) {
  return (
    <div
      data-fade-up
      className="opacity-0 bg-white/[0.02] border border-white/[0.06] rounded-sm p-6 sm:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <Icon className="w-5 h-5 text-support-light shrink-0" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-white/75 text-base leading-relaxed">
            <span className="text-support-light mt-1.5 shrink-0">—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

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
            delay: (_: unknown, i: number) => i * 100,
            duration: 700,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

export default function PosterPage() {
  const heroRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const guidelinesRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  useScrollFade(heroRef);
  useScrollFade(timelineRef);
  useScrollFade(guidelinesRef);
  useScrollFade(formRef);

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden"
        >
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p
              data-fade-up
              className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4"
            >
              ALPS Conference 2026
            </p>
            <h1
              data-fade-up
              className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6"
            >
              Call for Research Posters
            </h1>
            <p
              data-fade-up
              className="opacity-0 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Present your psychedelic science research at the sixth edition of the ALPS
              Conference — 9–10 October 2026, Aarau, Switzerland.
            </p>
            <a
              data-fade-up
              href="https://forms.gle/kFE4LkUcwsVeejDSA"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 inline-block px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
            >
              Submit Your Poster
            </a>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section
          ref={timelineRef}
          className="relative py-24 sm:py-32 bg-white/[0.02]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
                Key dates
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Application Timeline
              </h2>
            </div>

            <div className="max-w-lg">
              {TIMELINE.map((item, i) => (
                <TimelineItem key={i} index={i} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Guidelines ── */}
        <section ref={guidelinesRef} className="relative py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
                Requirements
              </p>
              <h2 className="text-3xl font-semibold text-white">
                Submission Guidelines
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-1">
              {GUIDELINES.map((g) => (
                <GuidelineCard key={g.title} {...g} />
              ))}
            </div>

            <div
              data-fade-up
              className="opacity-0 mt-8 bg-white/[0.02] border border-white/[0.06] rounded-sm p-6 sm:p-8"
            >
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-support-light shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Evaluation Criteria
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Scientific quality and methodological rigour",
                      "Relevance to the conference themes and the psychedelic research field",
                      "Clarity of presentation and visual communication",
                      "Originality and potential impact of the work",
                    ].map((item, i) => (
                      <li key={i} className="flex gap-3 text-white/75 text-base leading-relaxed">
                        <span className="text-support-light mt-1.5 shrink-0">—</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <p className="mt-6 text-white/60 text-sm leading-relaxed">
                    All submissions are reviewed by the ALPS scientific committee. Authors
                    will be notified of the decision by <strong className="text-white/80">7 September 2026</strong>.
                    Accepted posters must be submitted as a print-ready PDF by{" "}
                    <strong className="text-white/80">28 September 2026</strong>.
                  </p>
                </div>
              </div>
            </div>

            <p
              data-fade-up
              className="opacity-0 mt-6 text-white/50 text-sm text-center"
            >
              Questions? Write to us at{" "}
              <a
                href="mailto:info@alps.foundation"
                className="text-support-light hover:text-white transition-colors"
              >
                info@alps.foundation
              </a>
            </p>
          </div>
        </section>

        {/* ── Form ── */}
        <section
          ref={formRef}
          className="relative py-24 sm:py-32 bg-white/[0.02]"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 text-center mb-12">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
                Ready to apply?
              </p>
              <h2 className="text-3xl font-semibold text-white mb-4">
                Submit Your Poster Application
              </h2>
              <p className="text-white/60 text-base max-w-xl mx-auto">
                Applications are open until <strong className="text-white/80">31 August 2026</strong>.
                The application takes approximately 10–15 minutes to complete.
              </p>
            </div>

            <div data-fade-up className="opacity-0">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-sm p-10 sm:p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-support/15 border border-support/20 flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-6 h-6 text-support-light" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">
                    Poster Application Form
                  </h3>
                  <p className="text-white/60 text-base mb-8 leading-relaxed">
                    Submit your abstract, author information, and research details via our
                    online application form.
                  </p>
                  <a
                    href="https://forms.gle/kFE4LkUcwsVeejDSA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
                  >
                    Apply Now ↗
                  </a>
                  <p className="mt-5 text-white/40 text-sm">
                    Opens in a new tab · Google Forms
                  </p>
                </div>
              </div>
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
