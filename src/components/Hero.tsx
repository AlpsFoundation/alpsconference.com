import { useEffect, useRef, useState } from "react";
import { Mail, MapPin, Clock } from "lucide-react";
import { animate, stagger } from "animejs";
import { withBase } from "../lib/withBase";
import ParticlesCanvas from "./ParticlesCanvas";
import ConferenceCountdown from "./ConferenceCountdown";
import SynapseIllustration from "./SynapseIllustration";

// "image": the static bones.png. "synapse": its 3D rendition, which draws itself
// first and cues the title and the particles in (see the home page; /static uses the image).
export type HeroIllustration = "image" | "synapse";

// Show the content anyway if the 3D intro never cues it (slow or failed load).
const TITLE_FALLBACK_MS = 5000;

// Title words, grouped into the runs that must not wrap; each letter animates in on its own.
// The greeting sits on its own smaller line above the name.
const GREETING = ["Welcome", "to"];
const TITLE = [["ALPS"], ["CONFERENCE", "2026"]];
const TITLE_LABEL = "Welcome to ALPS Conference 2026";

function TitleLetters({ words }: { words: string[] }) {
  return (
    <span className="whitespace-nowrap">
      {words.map((word, w) => (
        <span key={w}>
          {w > 0 && " "}
          {[...word].map((letter, l) => (
            <span
              key={l}
              data-letter
              className="inline-block opacity-0 will-change-transform bg-gradient-to-b from-white/45 via-white/85 to-white bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
            >
              {letter}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

// On short desktop windows the illustration shrinks to keep the boutons between
// the title and the event details, which take about 510px of the hero's height
// between them. Keep in step with the bones box's lg:max-w below.
const illustrationMaxWidth = (_w: number, h: number) =>
  window.innerWidth >= 1024 ? Math.max(320, 3.3 * (h - 510)) : Infinity;
const SYNAPSE_OPTIONS = { maxWidth: illustrationMaxWidth };

export default function Hero({ illustration = "image" }: { illustration?: HeroIllustration }) {
  const sectionRef = useRef<HTMLElement>(null);
  const bonesRef = useRef<HTMLDivElement>(null);
  const contentShown = useRef(false);
  const is3d = illustration === "synapse";
  const [synapseFailed, setSynapseFailed] = useState(false);
  const [particlesOn, setParticlesOn] = useState(!is3d);
  const showImage = !is3d || synapseFailed;

  const showContent = () => {
    const el = sectionRef.current;
    if (!el || contentShown.current) return;
    contentShown.current = true;

    // Title letter by letter, then the details and buttons, the countdown last.
    el.querySelector("h1")?.classList.remove("opacity-0");
    animate(el.querySelectorAll("[data-letter]"), {
      opacity: [0, 1],
      translateY: ["0.3em", "0em"],
      scale: [0.92, 1],
      delay: stagger(38),
      duration: 750,
      ease: "outCubic",
    });

    animate(el.querySelectorAll("[data-animate]"), {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(160, { start: 380 }),
      duration: 700,
      ease: "outCubic",
    });

    animate(el.querySelectorAll("[data-animate-scale]"), {
      opacity: [0, 1],
      scale: [0.96, 1],
      delay: stagger(80, { start: 480 }),
      duration: 600,
      ease: "outCubic",
    });

    animate(el.querySelectorAll("[data-animate-last]"), {
      opacity: [0, 1],
      translateY: [-10, 0],
      delay: 1150,
      duration: 700,
      ease: "outCubic",
    });
  };

  const onSynapseUnsupported = () => {
    setSynapseFailed(true);
    setParticlesOn(true);
    showContent();
  };

  useEffect(() => {
    if (!is3d) {
      showContent();
      return;
    }
    const timer = window.setTimeout(() => {
      showContent();
      setParticlesOn(true);
    }, TITLE_FALLBACK_MS);
    return () => window.clearTimeout(timer);
  }, [is3d]);

  useEffect(() => {
    if (!showImage) return;
    const bones = bonesRef.current;
    if (bones) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        bones.style.opacity = "1";
        bones.style.transform = "scale(1)";
      } else {
        animate(bones, {
          opacity: [0, 1],
          scale: [1.08, 1],
          duration: 1200,
          delay: 80,
          easing: "easeOutCubic",
        });
      }
    }
  }, [showImage]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen min-h-[100dvh] flex flex-col overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src={withBase("img/background.jpg")}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/50 via-neutral-dark/20 to-neutral-dark" />
        <div
          className={`absolute inset-0 transition-opacity duration-[1600ms] ease-out ${particlesOn ? "opacity-100" : "opacity-0"}`}
        >
          <ParticlesCanvas variant="hero" scale={is3d ? 1.6 : 1} />
        </div>
      </div>

      {is3d && !synapseFailed && (
        <SynapseIllustration
          interactionTarget={sectionRef}
          options={SYNAPSE_OPTIONS}
          onTitle={showContent}
          onParticles={() => setParticlesOn(true)}
          onUnsupported={onSynapseUnsupported}
        />
      )}

      {/* Bones illustration */}
      {showImage && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none [container-type:size]">
          <div
            ref={bonesRef}
            className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-2 opacity-0 will-change-transform"
            style={{ transformOrigin: "center center" }}
          >
            {/* Enlarged below sm; keep in step with the embedded framing in synapse3d.ts. */}
            <div className="origin-center scale-[1.5] min-[480px]:scale-[1.75] sm:scale-100 lg:mx-auto lg:max-w-[max(320px,calc((100cqh-510px)*3.3))]">
              <img
                src={withBase("img/bones.png")}
                alt=""
                className="w-full h-auto object-contain opacity-60 mix-blend-screen drop-shadow-[0_0_3rem_rgba(5,8,22,0.45)]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Content: upper / middle / lower thirds to keep center clear for illustration */}
      <div className="relative z-10 flex flex-1 flex-col min-h-0 max-w-5xl lg:max-w-6xl w-full mx-auto px-4 sm:px-6 text-center pt-[calc(5rem+var(--site-banner-height))] sm:pt-[calc(6rem+var(--site-banner-height))]">
        <div className="flex-[1_1_0] flex flex-col items-center justify-start min-h-0">
          <div data-animate-last className="opacity-0">
            <ConferenceCountdown />
          </div>
          <h1
            aria-label={TITLE_LABEL}
            className="opacity-0 mt-4 text-[length:min(2.25rem,calc((100vw-2rem)/8.9))] sm:max-md:text-7xl md:text-7xl lg:whitespace-nowrap lg:text-[length:min(6rem,calc((100vw-3rem)/11.6))] font-bold tracking-[-0.035em] leading-[0.96] mb-4 sm:mb-6 mx-auto [text-shadow:0_0_1px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5),0_0_48px_rgba(255,255,255,0.28)]"
          >
            <span
              aria-hidden="true"
              className="block mb-[0.45em] text-[length:min(1.35rem,calc((100vw-2rem)/14))] sm:text-3xl lg:text-4xl font-semibold tracking-[-0.02em]"
            >
              <TitleLetters words={GREETING} />
            </span>
            {TITLE.map((run, r) => (
              <span key={r} aria-hidden="true">
                {r > 0 && " "}
                <TitleLetters words={run} />
              </span>
            ))}
          </h1>
        </div>

        <div className="flex-[1_1_0] min-h-0 shrink-0" aria-hidden="true" />

        <div className="flex-[1_1_0] flex flex-col items-center justify-end gap-4 sm:gap-5 min-h-0 pb-4 sm:pb-28 lg:pb-10">
          <div
            data-animate
            className="opacity-0 flex w-full max-w-full flex-wrap sm:flex-nowrap items-center justify-center gap-x-2 gap-y-1 min-[380px]:gap-x-3 sm:gap-6"
          >
            <div className="flex shrink-0 items-center gap-1.5 min-[380px]:gap-2 text-white">
              <Clock className="w-5 h-5 text-support-light" />
              <span className="whitespace-nowrap text-[13px] min-[380px]:text-[15px] min-[430px]:text-base sm:text-xl font-semibold">
                9-10 October 2026
              </span>
            </div>
            <span className="hidden sm:block w-px h-5 shrink-0 bg-white/20" />
            <div className="flex shrink-0 items-center gap-1.5 min-[380px]:gap-2 text-white">
              <MapPin className="w-5 h-5 text-support-light" />
              <span className="whitespace-nowrap text-[13px] min-[380px]:text-[15px] min-[430px]:text-base sm:text-xl font-semibold">
                Kultur & Kongresshaus Aarau, Switzerland
              </span>
            </div>
          </div>

          <a
            data-animate-scale
            href="#newsletter"
            className="opacity-0 flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-7 py-2.5 sm:py-3 bg-white/5 hover:bg-white/[0.08] text-white hover:text-white text-sm sm:text-base font-medium rounded-sm border border-white/10 hover:border-white/25 transition-all duration-300 leading-tight"
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="whitespace-nowrap">Stay in Touch</span>
          </a>
        </div>
      </div>
    </section>
  );
}
