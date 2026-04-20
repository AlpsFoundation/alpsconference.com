import { useEffect, useRef } from "react";
import { Calendar, Clock, MapPin, Users, Globe, ArrowLeft, Check } from "lucide-react";
import { animate } from "animejs";
import { withBase } from "../lib/withBase";
import ParticlesCanvas from "./ParticlesCanvas";
import Footer from "./Footer";

const WORKSHOPS = [
  {
    language: "Deutsch",
    flag: "🇩🇪",
    title: "Grundlagen der Psychedelika-Assistierten Therapie",
    instructor: "Dr. med. Petra Schneider",
    bio: "Leitende Ärztin für Psychiatrie mit über 15 Jahren Erfahrung in der klinischen Forschung zu psychedelischen Substanzen.",
    description:
      "Dieser Workshop bietet eine umfassende Einführung in die Psychedelika-assistierte Psychotherapie, einschliesslich der Geschichte, wissenschaftlicher Grundlagen und klinischer Anwendungen. Teilnehmende lernen die therapeutischen Rahmenbedingungen und ethischen Überlegungen kennen.",
    topics: [
      "Geschichte und Wiederentdeckung der Psychedelika-Therapie",
      "Neurobiologische Wirkmechanismen",
      "Therapeutisches Setting und Integration",
      "Ethische und rechtliche Rahmenbedingungen",
    ],
  },
  {
    language: "Français",
    flag: "🇫🇷",
    title: "Approches Intégratives en Psychothérapie Assistée par Psychédéliques",
    instructor: "Dr. Marie-Claire Dubois",
    bio: "Psychologue clinicienne et chercheuse spécialisée dans les thérapies assistées par substances psychédéliques à l'Université de Genève.",
    description:
      "Ce workshop explore les approches intégratives combinant la psychothérapie traditionnelle avec les substances psychédéliques. Les participants découvriront comment intégrer ces expériences dans un cadre thérapeutique sécurisé et efficace.",
    topics: [
      "Modèles d'intégration thérapeutique",
      "Préparation et accompagnement du patient",
      "Techniques de soutien pendant les sessions",
      "Suivi post-expérience et intégration à long terme",
    ],
  },
  {
    language: "Italiano",
    flag: "🇮🇹",
    title: "Sicurezza e Protocolli Clinici nella Terapia Psichedelica",
    instructor: "Prof. Alessandro Rossi",
    bio: "Professore di Psichiatria presso l'Università della Svizzera Italiana con focus sulla ricerca clinica sui trattamenti innovativi.",
    description:
      "Questo workshop si concentra sulla sicurezza clinica e sui protocolli essenziali per la somministrazione di terapie psichedeliche. I partecipanti impareranno le migliori pratiche per garantire esperienze sicure e terapeuticamente efficaci.",
    topics: [
      "Valutazione e screening dei pazienti",
      "Protocolli di dosaggio e somministrazione",
      "Gestione delle situazioni difficili",
      "Documentazione e standard di qualità",
    ],
  },
  {
    language: "English",
    flag: "🇬🇧",
    title: "Future Directions in Psychedelic-Assisted Psychotherapy",
    instructor: "Dr. Sarah Mitchell, PhD",
    bio: "Leading researcher in psychedelic neuroscience and clinical applications, with publications in Nature and The Lancet.",
    description:
      "This workshop examines the cutting-edge developments and future directions in psychedelic-assisted psychotherapy. Participants will explore emerging research, novel compounds, and the evolving landscape of psychedelic medicine.",
    topics: [
      "Latest clinical trial findings",
      "Novel psychedelic compounds under investigation",
      "Digital therapeutics and psychedelic therapy",
      "Policy developments and global perspectives",
    ],
  },
];

const PRICING_TIERS = [
  {
    name: "Early Bird",
    price: 120,
    description: "Limited availability",
    deadline: "Until July 31, 2026",
    features: ["Full workshop access", "Conference materials", "Networking lunch", "Certificate of attendance"],
    highlighted: false,
  },
  {
    name: "Standard",
    price: 150,
    description: "Regular price",
    deadline: "August 1 – September 15",
    features: ["Full workshop access", "Conference materials", "Networking lunch", "Certificate of attendance"],
    highlighted: true,
  },
  {
    name: "Last Call",
    price: 175,
    description: "Final tickets",
    deadline: "September 16 onwards",
    features: ["Full workshop access", "Conference materials", "Networking lunch", "Certificate of attendance"],
    highlighted: false,
  },
];

const SCHEDULE = [
  { time: "08:30 – 09:00", event: "Registration & Welcome Coffee" },
  { time: "09:00 – 09:15", event: "Opening Remarks" },
  { time: "09:15 – 10:45", event: "Workshop Session I" },
  { time: "10:45 – 11:15", event: "Coffee Break & Networking" },
  { time: "11:15 – 12:45", event: "Workshop Session II" },
  { time: "12:45 – 14:00", event: "Networking Lunch" },
  { time: "14:00 – 15:30", event: "Workshop Session III" },
  { time: "15:30 – 16:00", event: "Coffee Break" },
  { time: "16:00 – 17:00", event: "Panel Discussion & Q&A" },
  { time: "17:00 – 17:30", event: "Closing Ceremony" },
];

function WorkshopNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href={withBase("")} className="flex items-center gap-3 shrink-0">
            <img src={withBase("img/logo.png")} alt="ALPS" className="h-8 lg:h-10 w-auto" />
          </a>
          <a
            href={withBase("")}
            className="flex items-center gap-2 px-4 py-2 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 rounded-sm hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Conference
          </a>
        </div>
      </div>
    </nav>
  );
}

function WorkshopHero() {
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
  }, []);

  const handleCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      "DTSTART:20261008T083000Z",
      "DTEND:20261008T173000Z",
      "SUMMARY:ALPS Workshop Day 2026",
      "LOCATION:Kultur & Kongresshaus Aarau, Schlossplatz, Aarau, Switzerland",
      "DESCRIPTION:Pre-conference workshops in Psychedelic-Assisted Psychotherapy",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "alps-workshop-2026.ics";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section ref={sectionRef} className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      <div className="absolute inset-0">
        <img src={withBase("img/background.jpg")} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-dark/70 via-neutral-dark/50 to-neutral-dark" />
        <ParticlesCanvas variant="footer" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div
          data-animate
          className="opacity-0 inline-flex items-center gap-2 px-4 py-2 mb-6 bg-accent/20 border border-accent/30 rounded-sm text-accent-light text-sm font-medium"
        >
          <Calendar className="w-4 h-4" />
          Pre-Conference Event
        </div>

        <h1
          data-animate
          className="opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6 bg-gradient-to-b from-white via-white/90 to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]"
        >
          ALPS Workshop Day 2026
        </h1>

        <p data-animate className="opacity-0 text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Four parallel workshops on Psychedelic-Assisted Psychotherapy, delivered by experienced clinicians and
          pioneers in the field.
        </p>

        <div data-animate className="opacity-0 flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-10">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-5 h-5 text-support-light" />
            <span className="text-base sm:text-lg font-medium">Thursday, October 8, 2026</span>
          </div>
          <span className="hidden sm:block w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2 text-white">
            <MapPin className="w-5 h-5 text-support-light" />
            <span className="text-base sm:text-lg font-medium">Aarau, Switzerland</span>
          </div>
          <span className="hidden sm:block w-px h-5 bg-white/20" />
          <div className="flex items-center gap-2 text-white">
            <Globe className="w-5 h-5 text-support-light" />
            <span className="text-base sm:text-lg font-medium">4 Languages</span>
          </div>
        </div>

        <div data-animate className="opacity-0 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <a
            href="#tickets"
            className="px-6 sm:px-8 py-3 sm:py-4 bg-accent hover:bg-accent-light text-white text-base font-medium rounded-sm transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
          >
            Register Now
          </a>
          <button
            onClick={handleCalendar}
            className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white/5 hover:bg-white/10 text-white text-base font-medium rounded-sm border border-white/10 hover:border-white/25 transition-all duration-300 cursor-pointer"
          >
            <Calendar className="w-5 h-5" />
            Save the Date
          </button>
        </div>
      </div>
    </section>
  );
}

function WorkshopSessions() {
  return (
    <section id="workshops" className="py-20 sm:py-28 bg-neutral-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Workshop Sessions
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Choose from four parallel workshops delivered in different languages. Each session covers cutting-edge
            topics in Psychedelic-Assisted Psychotherapy.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {WORKSHOPS.map((workshop, index) => (
            <div
              key={index}
              className="group relative bg-white/[0.02] border border-white/10 rounded-sm p-6 sm:p-8 hover:bg-white/[0.04] hover:border-white/20 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{workshop.flag}</span>
                <span className="px-3 py-1 bg-support/20 border border-support/30 rounded-sm text-support-light text-sm font-medium">
                  {workshop.language}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{workshop.title}</h3>

              <div className="flex items-center gap-2 mb-4 text-accent-light">
                <Users className="w-4 h-4" />
                <span className="font-medium">{workshop.instructor}</span>
              </div>

              <p className="text-sm text-white/60 mb-4 italic">{workshop.bio}</p>

              <p className="text-white/80 mb-6">{workshop.description}</p>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-white/90 uppercase tracking-wide">Topics Covered</h4>
                <ul className="space-y-2">
                  {workshop.topics.map((topic, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-4 h-4 text-support-light shrink-0 mt-0.5" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Schedule() {
  return (
    <section id="schedule" className="py-20 sm:py-28 bg-primary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Schedule
          </h2>
          <p className="text-lg text-white/70">Thursday, October 8, 2026</p>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
          {SCHEDULE.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 px-6 py-4 ${
                index !== SCHEDULE.length - 1 ? "border-b border-white/5" : ""
              } ${item.event.includes("Session") ? "bg-support/10" : ""}`}
            >
              <span className="text-support-light font-mono text-sm sm:text-base sm:w-36 shrink-0">{item.time}</span>
              <span className="text-white/90 font-medium">{item.event}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="tickets" className="py-20 sm:py-28 bg-neutral-dark">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Tickets
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Secure your spot at the ALPS Workshop Day. Early registration is recommended as spaces are limited.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PRICING_TIERS.map((tier, index) => (
            <div
              key={index}
              className={`relative bg-white/[0.02] border rounded-sm p-6 sm:p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "border-accent/50 bg-accent/5 scale-[1.02] shadow-xl shadow-accent/10"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-semibold uppercase tracking-wide rounded-sm">
                  Most Popular
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-white/60 mb-4">{tier.deadline}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl sm:text-5xl font-bold text-white">CHF {tier.price}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-white/80">
                    <Check className="w-4 h-4 text-support-light shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <a
                href="#register"
                className={`block w-full py-3 text-center font-medium rounded-sm transition-all duration-300 ${
                  tier.highlighted
                    ? "bg-accent hover:bg-accent-light text-white"
                    : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                }`}
              >
                Select Ticket
              </a>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-white/50 mt-8">
          All prices include VAT. Ticket sales will open soon.
        </p>
      </div>
    </section>
  );
}

function Location() {
  return (
    <section id="location" className="py-20 sm:py-28 bg-primary/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent [-webkit-text-fill-color:transparent]">
            Location
          </h2>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-sm overflow-hidden">
          <div className="aspect-video bg-primary/50">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2699.1!2d8.0462!3d47.3921!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47903be8c0e1f5d5%3A0x1!2sKultur%20%26%20Kongresshaus%20Aarau!5e0!3m2!1sen!2sch!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kultur & Kongresshaus Aarau"
            />
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-2">Kultur & Kongresshaus Aarau</h3>
            <p className="text-white/70 mb-4">Schlossplatz, 5000 Aarau, Switzerland</p>
            <p className="text-sm text-white/60">
              The venue is centrally located and easily accessible by public transport. Aarau train station is just a
              5-minute walk away.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Workshop() {
  return (
    <>
      <WorkshopNavbar />
      <main>
        <WorkshopHero />
        <WorkshopSessions />
        <Schedule />
        <Pricing />
        <Location />
      </main>
      <div className="relative overflow-hidden">
        <ParticlesCanvas variant="footer" />
        <Footer />
      </div>
    </>
  );
}
