import { Users } from "lucide-react";
import { withBase } from "../lib/withBase";

interface Speaker {
  name: string;
  topic: string;
  image: string;
  confirmed: boolean;
}

const SPEAKERS: Speaker[] = [
  {
    name: "Eric Vermetten",
    topic: "MDMA for PTSD",
    image: withBase("img/speakers/eric-vermetten.svg"),
    confirmed: true,
  },
  {
    name: "Lydia Bellinger",
    topic: "Psychedelic Prosociality",
    image: withBase("img/speakers/lydia-bellinger.svg"),
    confirmed: true,
  },
  {
    name: "Leor Roseman",
    topic: "To be announced",
    image: withBase("img/speakers/leor-roseman.svg"),
    confirmed: false,
  },
  {
    name: "Tommaso Barba",
    topic: "To be announced",
    image: withBase("img/speakers/tommaso-barba.svg"),
    confirmed: false,
  },
  {
    name: "Rosalind McAlpine",
    topic: "To be announced",
    image: withBase("img/speakers/rosalind-mcalpin.svg"),
    confirmed: false,
  },
];

export default function Speakers() {
  return (
    <section id="speakers" className="relative py-24 lg:py-32 bg-gradient-to-b from-neutral-dark to-neutral-dark/95">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-sm bg-primary/10 mb-6">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-white">
            Featured Speakers
          </h2>
          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto">
            Join us for insights from leading researchers and practitioners in the field of psychedelic science.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-12">
          {SPEAKERS.map((speaker) => (
            <div
              key={speaker.name}
              className="group relative bg-white/5 backdrop-blur-sm rounded-sm border border-white/10 p-6 transition-all duration-300 hover:bg-white/[0.07] hover:border-white/20"
            >
              {!speaker.confirmed && (
                <div className="absolute top-4 right-4 px-3 py-1 bg-support/20 border border-support/30 rounded-sm text-xs font-medium text-white/80">
                  TBC
                </div>
              )}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-4">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full h-full rounded-full object-cover ring-4 ring-white/10 transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {speaker.name}
                </h3>
                <p className="text-base text-white/70 italic">
                  {speaker.topic}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-sm">
            <Users className="w-5 h-5 text-primary" />
            <p className="text-base text-white/90 font-medium">
              More speakers to be announced soon
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
