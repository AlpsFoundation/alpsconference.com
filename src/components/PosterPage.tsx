import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Calendar, FileText, CheckCircle, Users, Printer, ImageIcon } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";

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

const COMMITTEE = [
  { name: "Abigail Calder", role: "PhD Candidate" },
  { name: "Federico Seragnoli", role: "PhD Candidate" },
  { name: "Cyril Petignat", role: "PhD Candidate" },
];

function TimelineItem({ date, label, done }: { date: string; label: string; done: boolean }) {
  return (
    <div className="relative flex gap-6 pb-10 last:pb-0" data-fade-up style={{ opacity: 0 }}>
      <div className="flex flex-col items-center">
        <div
          className={`w-4 h-4 rounded-full border-2 shrink-0 mt-1 ${
            done ? "bg-support border-support" : "bg-transparent border-white/30"
          }`}
        />
        <div className="w-px flex-1 bg-white/10 mt-2" />
      </div>
      <div className="pb-2">
        <p className="text-sm font-medium text-support-light tracking-wide uppercase mb-1">{date}</p>
        <p className="text-lg text-white/90 font-medium">{label}</p>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div data-fade-up className="opacity-0 bg-white/[0.02] border border-white/[0.06] rounded-sm p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-5">
        <Icon className="w-5 h-5 text-support-light shrink-0" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-white/75 text-base leading-relaxed">
          <span className="text-support-light mt-1.5 shrink-0">—</span>
          {item}
        </li>
      ))}
    </ul>
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
        <section ref={heroRef} className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <p data-fade-up className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4">
              ALPS Conference 2026
            </p>
            <h1 data-fade-up className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              Call for Research Posters
            </h1>
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
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
        <section ref={timelineRef} className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Key dates</p>
              <h2 className="text-3xl font-semibold text-white">Application Timeline</h2>
            </div>
            <div className="max-w-lg">
              {TIMELINE.map((item, i) => (
                <TimelineItem key={i} {...item} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Guidelines ── */}
        <section ref={guidelinesRef} className="relative py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Requirements</p>
              <h2 className="text-3xl font-semibold text-white">Submission Guidelines</h2>
            </div>

            <div className="space-y-6">

              {/* Poster content */}
              <Section icon={FileText} title="Poster Content">
                <BulletList items={[
                  "Posters must be relevant to the field of psychedelic science.",
                  "The paper title, all authors, and affiliations must be displayed at the top of the poster.",
                  "Posters should include a brief introduction, goals, methodological details (when applicable), conclusions, and references — presented in a logical and clear sequence.",
                  "The research presented must be conducted ethically, with the safety and well-being of participants in mind.",
                  "Original research is highly encouraged. We also accept methodological perspectives, meta-analyses, reviews, case reports, and other topics relevant to psychedelic science.",
                ]} />
              </Section>

              {/* Format */}
              <Section icon={Printer} title="Poster Format">
                <BulletList items={[
                  "Size: A0 portrait format — 84.1 cm × 118.9 cm (33.1 × 46.8 in).",
                  "Orientation: Portrait only. There will be no possibility for horizontal display.",
                  "Presenters are responsible for printing their own poster. ALPS does not print posters.",
                ]} />
              </Section>

              {/* Review committee */}
              <Section icon={Users} title="Review Committee">
                <p className="text-white/65 text-base mb-5 leading-relaxed">
                  A committee of experts evaluates all applications:
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {COMMITTEE.map((person) => (
                    <div key={person.name} className="bg-white/[0.03] border border-white/[0.05] rounded-sm px-4 py-3">
                      <p className="text-white font-medium text-base">{person.name}</p>
                      <p className="text-white/50 text-sm mt-0.5">{person.role}</p>
                    </div>
                  ))}
                </div>
              </Section>

              {/* Setting up */}
              <Section icon={Calendar} title="Setting Up Your Poster">
                <BulletList items={[
                  "In order to present your poster at the conference, you must hold a valid conference ticket.",
                  "All presenters are encouraged to put up their posters at the beginning of the conference on Friday, 9 October 2026 at 12:00.",
                  "ALPS will provide push pins, tape, or Velcro for hanging posters.",
                ]} />
              </Section>

              {/* Presenting */}
              <Section icon={CheckCircle} title="Presenting Your Poster">
                <BulletList items={[
                  "Each poster presenter is responsible for printing their poster and bringing it to the conference.",
                  "The poster must be printed in vertical (portrait) format — horizontal display is not possible.",
                  "Prepare a short tour of your poster that you can present to visitors.",
                  "Presenters are encouraged to stand by their posters during breaks to engage with attendees and answer questions.",
                  "Presenters must remove their printed posters before the end of the conference.",
                ]} />
              </Section>

              {/* PDF / website */}
              <Section icon={ImageIcon} title="PDF Submission for the Website">
                <p className="text-white/65 text-base mb-4 leading-relaxed">
                  If your application is selected, you will be contacted and asked for:
                </p>
                <BulletList items={[
                  "Your poster as a print-ready PDF.",
                  "A short summary of your research.",
                  "A profile picture and short biography.",
                ]} />
                <p className="mt-5 text-white/50 text-sm leading-relaxed">
                  These will be uploaded on the ALPS 2026 conference website with your consent. By submitting a poster and being selected, presenters agree to allow their work to be displayed and published in conference materials and online platforms.
                </p>
              </Section>

            </div>

            <p data-fade-up className="opacity-0 mt-8 text-white/50 text-sm text-center">
              Questions? Write to us at{" "}
              <a href="mailto:info@alps.foundation" className="text-support-light hover:text-white transition-colors">
                info@alps.foundation
              </a>
            </p>
          </div>
        </section>

        {/* ── Form ── */}
        <section ref={formRef} className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 text-center mb-12">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
                Ready to apply?
              </p>
              <h2 className="text-3xl font-semibold text-white mb-4">Submit Your Poster Application</h2>
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
                  <h3 className="text-xl font-semibold text-white mb-3">Poster Application Form</h3>
                  <p className="text-white/60 text-base mb-8 leading-relaxed">
                    Submit your abstract, author information, and research details via our online application form.
                  </p>
                  <a
                    href="https://forms.gle/kFE4LkUcwsVeejDSA"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
                  >
                    Apply Now ↗
                  </a>
                  <p className="mt-5 text-white/40 text-sm">Opens in a new tab · Google Forms</p>
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
