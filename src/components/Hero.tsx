import { useEffect, useRef, useState } from "react";
import { Calendar, Ticket, Mail, MapPin, Clock } from "lucide-react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import ParticlesCanvas from "./ParticlesCanvas";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const bonesRef = useRef<HTMLDivElement>(null);
  const ticketTooltipRef = useRef<HTMLDivElement>(null);
  const [ticketTooltipOpen, setTicketTooltipOpen] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    animate(el.querySelectorAll("[data-animate]"), {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: (_: unknown, i: number) => 200 + i * 120,
      duration: 900,
      easing: "easeOutCubic",
    });

    animate(el.querySelectorAll("[data-animate-scale]"), {
      opacity: [0, 1],
      scale: [0.9, 1],
      delay: (_: unknown, i: number) => 600 + i * 100,
      duration: 800,
      easing: "easeOutCubic",
    });

    const bones = bonesRef.current;
    if (bones) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        bones.style.opacity = "1";
        bones.style.transform = "scale(1)";
      } else {
        animate(bones, {
          opacity: [0, 1],
          scale: [1.08, 1],
          duration: 1600,
          delay: 80,
          easing: "easeOutCubic",
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!ticketTooltipOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!ticketTooltipRef.current?.contains(event.target as Node)) {
        setTicketTooltipOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setTicketTooltipOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [ticketTooltipOpen]);

  const handleCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART:20261009T090000Z",
      "DTEND:20261010T180000Z",
      "SUMMARY:ALPS Research Conference 2026",
      "LOCATION:Kultur & Kongresshaus Aarau, Schlossplatz, Aarau, Switzerland",
      "DESCRIPTION:Awareness Lectures on Psychedelics in Switzerland - Research Conference",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alps-conference-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <ParticlesCanvas variant="hero" />
      </div>

      {/* Bones illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={bonesRef}
          className="w-full max-w-4xl sm:max-w-5xl lg:max-w-6xl xl:max-w-7xl px-2 opacity-0 will-change-transform"
          style={{ transformOrigin: "center center" }}
        >
          <div className="origin-center scale-[2] sm:scale-100">
            <img
              src={withBase("img/bones.png")}
              alt=""
              className="w-full h-auto object-contain opacity-100 mix-blend-screen drop-shadow-[0_0_3rem_rgba(5,8,22,0.45)]"
            />
          </div>
        </div>
      </div>

      {/* Content: upper / middle / lower thirds to keep center clear for illustration */}
      <div className="relative z-10 flex flex-1 flex-col min-h-0 max-w-4xl w-full mx-auto px-4 sm:px-6 text-center pt-24">
        <div className="flex-[1_1_0] flex flex-col items-center justify-start min-h-0">
          <h1
            data-animate
            className="opacity-0 text-4xl sm:max-md:text-7xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-4 sm:mb-6 max-w-5xl mx-auto bg-gradient-to-b from-white/45 via-white/85 to-white bg-clip-text text-transparent [-webkit-text-fill-color:transparent] [text-shadow:0_0_1px_rgba(255,255,255,0.95),0_0_20px_rgba(255,255,255,0.5),0_0_48px_rgba(255,255,255,0.28)]"
          >
            ALPS RESEARCH{" "}
            <span className="whitespace-nowrap">CONFERENCE 2026</span>
          </h1>
        </div>

        <div className="flex-[1_1_0] min-h-0 shrink-0" aria-hidden="true" />

        <div className="flex-[1_1_0] flex flex-col items-center justify-end gap-4 sm:gap-5 min-h-0 pb-28">
          <div
            data-animate
            className="opacity-0 flex w-full max-w-full flex-nowrap items-center justify-center gap-2 min-[380px]:gap-3 sm:gap-6"
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
                Aarau, Switzerland
              </span>
            </div>
          </div>

          <p data-animate className="opacity-0 text-base text-white/80">
            Kultur & Kongresshaus Aarau
          </p>

          <div className="flex flex-row flex-nowrap items-stretch justify-center gap-1 min-[400px]:gap-2 sm:gap-4 w-full max-w-full">
            <button
              data-animate-scale
              onClick={handleCalendar}
              className="opacity-0 group flex flex-1 sm:flex-initial min-w-0 items-center justify-center gap-1 sm:gap-2.5 px-2 min-[400px]:px-3 sm:px-7 py-2.5 sm:py-4 bg-support hover:bg-support-light text-white text-[11px] min-[400px]:text-xs sm:text-base font-medium rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-support/25 cursor-pointer leading-tight"
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="whitespace-nowrap">Save the Date</span>
            </button>

            <div
              ref={ticketTooltipRef}
              data-animate-scale
              className="opacity-0 relative group flex flex-1 sm:flex-initial min-w-0"
            >
              <button
                type="button"
                aria-describedby="ticket-sales-tooltip"
                aria-expanded={ticketTooltipOpen}
                onClick={() => setTicketTooltipOpen((open) => !open)}
                className="flex w-full min-w-0 items-center justify-center gap-1 sm:gap-2.5 px-2 min-[400px]:px-3 sm:px-7 py-2.5 sm:py-4 bg-white/5 hover:bg-white/[0.08] text-white/70 hover:text-white/90 text-[11px] min-[400px]:text-xs sm:text-base font-medium rounded-sm border border-white/10 cursor-help transition-colors duration-200 leading-tight"
              >
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="whitespace-nowrap">Buy Tickets</span>
              </button>
              <div
                id="ticket-sales-tooltip"
                role="tooltip"
                className={`absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-neutral-dark/95 border border-white/10 rounded-sm text-sm text-white/90 pointer-events-none transition-all duration-200 ${
                  ticketTooltipOpen
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                }`}
              >
                Sales start on Bicycle Day, April 19
              </div>
            </div>

            <a
              data-animate-scale
              href="#newsletter"
              className="opacity-0 flex flex-1 sm:flex-initial min-w-0 items-center justify-center gap-1 sm:gap-2.5 px-2 min-[400px]:px-3 sm:px-7 py-2.5 sm:py-4 bg-white/10 hover:bg-white/15 text-white text-[11px] min-[400px]:text-xs sm:text-base font-medium rounded-sm border border-white/10 hover:border-white/25 transition-all duration-300 leading-tight"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="whitespace-nowrap">Stay in Touch</span>
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-5 h-8 rounded-sm border-2 border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-sm bg-white/40" />
        </div>
      </div>
    </section>
  );
}
