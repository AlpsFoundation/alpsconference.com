import { useEffect, useRef } from "react";
import { ArrowLeft, Mic, ExternalLink } from "lucide-react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import ParticlesCanvas from "./ParticlesCanvas";

const FORM_URL = "https://forms.gle/gwA2GJAtxPCpfSXc7";

export default function CallForSpeakers() {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    animate(el.querySelectorAll("[data-animate]"), {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: (_: unknown, i: number) => 150 + i * 100,
      duration: 800,
      easing: "easeOutCubic",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-dark text-neutral-light">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <a href={withBase("")} className="flex items-center gap-3 shrink-0">
              <img
                src={withBase("img/logo.png")}
                alt="ALPS Research Conference"
                className="h-8 lg:h-10 w-auto"
              />
            </a>
            <a
              href={withBase("")}
              className="flex items-center gap-2 px-4 py-2 text-base font-medium text-white/90 hover:text-white rounded-sm hover:bg-white/5 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Conference
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={withBase("img/background.jpg")}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/60 via-neutral-dark/70 to-neutral-dark" />
          <ParticlesCanvas variant="hero" />
        </div>

        <div ref={headerRef} className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            data-animate
            className="opacity-0 inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium text-accent bg-accent/10 border border-accent/20 rounded-full"
          >
            <Mic className="w-3.5 h-3.5" />
            Submissions Open
          </div>

          <h1
            data-animate
            className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6 bg-gradient-to-b from-white/60 via-white/90 to-white bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
          >
            Call for Speakers
          </h1>

          <p
            data-animate
            className="opacity-0 text-lg sm:text-xl text-white/75 leading-relaxed mb-4 max-w-2xl mx-auto"
          >
            Share your research, clinical insights, or therapeutic practice at the ALPS
            Conference 2026 — the leading Swiss forum on psychedelic science and medicine.
          </p>

          <p data-animate className="opacity-0 text-base text-white/50 mb-10">
            9–10 October 2026 · Kultur &amp; Kongresshaus Aarau, Switzerland
          </p>

          <a
            data-animate
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 inline-flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-support hover:bg-support-light rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-support/30"
          >
            Submit Your Proposal
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Form embed */}
      <section className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-sm overflow-hidden border border-white/10 shadow-2xl shadow-primary/20 bg-white">
          <iframe
            src={FORM_URL}
            title="ALPS Conference 2026 – Speaker Submission"
            width="100%"
            height="900"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="block"
          >
            Loading form…
          </iframe>
        </div>
        <p className="mt-4 text-center text-sm text-white/40">
          Form not loading?{" "}
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-support-light hover:text-white underline transition-colors"
          >
            Open it directly
          </a>
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <a
            href="https://alps-foundation.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            © 2026 ALPS Foundation
          </a>
          <a
            href={withBase("")}
            className="hover:text-white transition-colors"
          >
            alpsconference.com
          </a>
        </div>
      </footer>
    </div>
  );
}
