import { useEffect, useRef } from "react";
import { Calendar, Ticket, Mail, MapPin, Clock } from "lucide-react";
import { animate } from "animejs";

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

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
  }, []);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers */}
      <div className="absolute inset-0">
        <img
          src="/img/background.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/40 via-transparent to-neutral-dark" />
      </div>

      {/* Bones illustration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src="/img/bones.png"
          alt=""
          className="w-full max-w-2xl h-auto object-contain opacity-30 mix-blend-screen"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center pt-24 pb-16">
        <div data-animate className="opacity-0">
          <img
            src="/img/logo.png"
            alt="ALPS Research Conference"
            className="mx-auto h-16 sm:h-20 lg:h-24 w-auto mb-6 drop-shadow-2xl"
          />
        </div>

        <p
          data-animate
          className="opacity-0 text-xs sm:text-sm tracking-[0.25em] uppercase text-secondary/70 font-medium mb-8"
        >
          Awareness Lectures on Psychedelics in Switzerland
        </p>

        <div data-animate className="opacity-0 flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-6">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-lg sm:text-xl font-semibold">9-10 October 2026</span>
          </div>
          <span className="hidden sm:block w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-accent" />
            <span className="text-lg sm:text-xl font-semibold">Aarau, Switzerland</span>
          </div>
        </div>

        <p data-animate className="opacity-0 text-sm text-secondary/60 mb-12">
          Kultur & Kongresshaus Aarau
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <button
            data-animate-scale
            onClick={handleCalendar}
            className="opacity-0 group flex items-center gap-2.5 px-6 py-3.5 bg-support hover:bg-support-light text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-support/25 cursor-pointer"
          >
            <Calendar className="w-4.5 h-4.5" />
            Save in Calendar
          </button>

          <div data-animate-scale className="opacity-0 relative group">
            <button
              disabled
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white/5 text-secondary/40 font-medium rounded-lg border border-white/10 cursor-not-allowed"
            >
              <Ticket className="w-4.5 h-4.5" />
              Buy Tickets
            </button>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 bg-neutral-dark/95 border border-white/10 rounded-md text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              Sales start on Bicycle Day, April 19
            </div>
          </div>

          <a
            data-animate-scale
            href="#newsletter"
            className="opacity-0 flex items-center gap-2.5 px-6 py-3.5 bg-accent/10 hover:bg-accent/20 text-accent font-medium rounded-lg border border-accent/20 hover:border-accent/40 transition-all duration-300"
          >
            <Mail className="w-4.5 h-4.5" />
            Sign up to Newsletter
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-5 h-8 rounded-full border-2 border-white/20 flex justify-center pt-1.5">
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </div>
      </div>
    </section>
  );
}
