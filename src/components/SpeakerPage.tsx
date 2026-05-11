import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { Mic, Calendar, Users, CheckCircle, Award } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ParticlesCanvas from "./ParticlesCanvas";
import { withBase } from "../lib/withBase";

const TIMELINE = [
  {
    date: "May 2026",
    label: "Application period opens",
    done: true,
  },
  {
    date: "30 June 2026",
    label: "Applications close",
    done: false,
  },
  {
    date: "Early August 2026",
    label: "Decisions communicated to all applicants",
    done: false,
  },
  {
    date: "9–10 October 2026",
    label: "ALPS Conference, Aarau, Switzerland",
    done: false,
  },
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
        <li key={i} className="flex gap-2.5 text-white/75 text-base leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-support-light/60 shrink-0 mt-2.5" />
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

export default function SpeakerPage() {
  const heroRef = useRef<HTMLElement>(null);
  const aboutRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLElement>(null);
  const guidelinesRef = useRef<HTMLElement>(null);
  const decisionRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLElement>(null);

  useScrollFade(heroRef);
  useScrollFade(aboutRef);
  useScrollFade(timelineRef);
  useScrollFade(guidelinesRef);
  useScrollFade(decisionRef);
  useScrollFade(formRef);

  return (
    <>
      <Navbar />

      <main>
        {/* ── Hero ── */}
        <section ref={heroRef} className="relative pt-40 pb-24 sm:pt-48 sm:pb-32 overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <div data-fade-up className="opacity-0 mb-8 flex justify-center">
              <img
                src={withBase("img/logo.png")}
                alt="ALPS Research Conference"
                className="h-16 sm:h-20 w-auto"
              />
            </div>
            <p data-fade-up className="opacity-0 text-base tracking-[0.2em] uppercase text-support-light font-medium mb-4">
              ALPS Conference 2026
            </p>
            <h1 data-fade-up className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight mb-6">
              Call for Speakers
            </h1>
            <p data-fade-up className="opacity-0 text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
              We invite PhD candidates, clinicians, and researchers to apply as speakers at the
              ALPS Conference on Psychedelic Science — 9–10 October 2026, Aarau, Switzerland.
            </p>
            <a
              data-fade-up
              href="https://docs.google.com/forms/d/e/1FAIpQLSfozNjid3EEMunE2Iwino-KnxMrtA5hX2a7uXi_ooK4ms-bqg/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-0 inline-block px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-colors duration-200"
            >
              Apply to Speak
            </a>
          </div>
        </section>

        {/* ── About the Conference ── */}
        <section ref={aboutRef} className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-10">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">About</p>
              <h2 className="text-3xl font-semibold text-white mb-6">The ALPS Conference</h2>
              <div className="space-y-4 text-white/70 text-base leading-relaxed max-w-3xl">
                <p>
                  The ALPS Conference (Awareness Lectures on Psychedelics in Switzerland) is an annual
                  scientific gathering bringing together researchers, clinicians, and academics from around
                  the world to advance the field of psychedelic science. Now in its sixth edition, ALPS 2026
                  takes place on <strong className="text-white/90">9–10 October 2026</strong> at the{" "}
                  <strong className="text-white/90">Kultur & Kongresshaus Aarau, Switzerland</strong>.
                </p>
                <p>
                  The conference covers clinical research, basic neuroscience, ethics and policy,
                  anthropology, and other topics relevant to psychedelic science. It is organized by the{" "}
                  <a
                    href="https://www.alps.foundation/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-support-light hover:text-white transition-colors underline underline-offset-2"
                  >
                    ALPS Foundation
                  </a>
                  , a Swiss non-profit dedicated to the responsible advancement of psychedelic research
                  and education.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Timeline ── */}
        <section ref={timelineRef} className="relative py-24 sm:py-32">
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
        <section ref={guidelinesRef} className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Requirements</p>
              <h2 className="text-3xl font-semibold text-white">Speaker Guidelines</h2>
            </div>

            <div className="space-y-6">

              <Section icon={Users} title="Who Can Apply">
                <BulletList items={[
                  "PhD candidates, post-doctoral researchers, clinicians, professors, and senior researchers are all encouraged to apply.",
                  "Applications are open to scientists working in any field relevant to psychedelic science, including clinical research, basic neuroscience, ethics & policy, anthropology, and related disciplines.",
                  "International applicants are welcome. The conference language is English.",
                ]} />
              </Section>

              <Section icon={Mic} title="Talk Format">
                <BulletList items={[
                  "Selected speakers will present a 45-minute talk followed by a 10-minute Q&A session.",
                  "Talks should present original research, clinical findings, theoretical perspectives, or methodological advances relevant to psychedelic science.",
                  "Presentations must be delivered in English.",
                  "Travel costs and accommodation are reimbursed at a fixed rate based on the speaker's country of origin. Details will be communicated upon selection.",
                ]} />
              </Section>

              <Section icon={CheckCircle} title="Eligibility & Content">
                <BulletList items={[
                  "Submitted work must be relevant to psychedelic science.",
                  "Research presented must meet ethical standards, with the safety and well-being of participants prioritized.",
                  "By applying and being selected, speakers agree to allow their name, affiliation, abstract, and biography to be published on the ALPS 2026 website and conference materials.",
                ]} />
              </Section>

            </div>
          </div>
        </section>

        {/* ── Decision Procedure ── */}
        <section ref={decisionRef} className="relative py-24 sm:py-32">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 mb-14">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">Selection</p>
              <h2 className="text-3xl font-semibold text-white">Decision Procedure</h2>
            </div>

            <div data-fade-up className="opacity-0 space-y-6">
              <Section icon={Award} title="How Speakers Are Selected">
                <div className="space-y-4 text-white/75 text-base leading-relaxed">
                  <p>
                    All applications are reviewed by the ALPS Conference Program Committee, composed of researchers
                    and clinicians active in the field of psychedelic science.
                  </p>
                  <p>Applications are evaluated based on:</p>
                  <BulletList items={[
                    "Scientific quality and relevance of the proposed talk.",
                    "Clarity and depth of the abstract.",
                    "Track record and expertise of the applicant.",
                    "Diversity of topics and backgrounds across the speaker programme.",
                  ]} />
                  <p className="mt-4">
                    All applicants — whether selected or not — will be notified of the committee's decision
                    by <strong className="text-white/90">early August 2026</strong>. Selected speakers will
                    receive further instructions regarding logistics, programme details, and conference
                    materials.
                  </p>
                </div>
              </Section>
            </div>

            <p data-fade-up className="opacity-0 mt-8 text-white/50 text-sm text-center">
              Any questions? Contact{" "}
              <a href="mailto:info@alps.foundation" className="text-support-light hover:text-white transition-colors">
                info@alps.foundation
              </a>
            </p>
          </div>
        </section>

        {/* ── Form CTA ── */}
        <section ref={formRef} className="relative py-24 sm:py-32 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div data-fade-up className="opacity-0 text-center mb-12">
              <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
                Ready to apply?
              </p>
              <h2 className="text-3xl font-semibold text-white mb-4">Submit Your Speaker Application</h2>
              <p className="text-white/60 text-base max-w-xl mx-auto">
                Applications are open until <strong className="text-white/80">30 June 2026</strong>.
              </p>
            </div>

            <div data-fade-up className="opacity-0">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-sm p-10 sm:p-16 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-14 h-14 rounded-full bg-support/15 border border-support/20 flex items-center justify-center mx-auto mb-6">
                    <Mic className="w-6 h-6 text-support-light" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">Speaker Application Form</h3>
                  <p className="text-white/60 text-base mb-8 leading-relaxed">
                    Submit your abstract, biography, and research details via our online application form.
                  </p>
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLSfozNjid3EEMunE2Iwino-KnxMrtA5hX2a7uXi_ooK4ms-bqg/viewform"
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
