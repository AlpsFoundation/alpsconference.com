import { useState, useRef, useEffect } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { animate } from "animejs";

import { NEWSLETTER_SIGNUP_URL, YOUTUBE_CHANNEL_URL } from "../data/postConference";

// ALPS Conference 2026 took place on 9–10 October 2026: questions are answered looking back.
const FAQS = [
  {
    category: "At the conference",
    items: [
      {
        q: "Where did the conference take place?",
        a: "At the Kultur & Kongresshaus Aarau, Schlossplatz 9, 5000 Aarau. More about the venue: [kuk-aarau.ch](https://www.kuk-aarau.ch/)"
      },
      {
        q: "What was the working language of the conference?",
        a: "English."
      },
      {
        q: "What food was served?",
        a: "Mainly vegetarian food, with vegan options at lunch and the networking apéro. Snacks during the breaks were vegetarian."
      },
      {
        q: "Was the event streamed live?",
        a: `No, but the sessions were recorded and will be published on our [YouTube channel](${YOUTUBE_CHANNEL_URL}).`
      },
      {
        q: "Were photos and videos taken at the event?",
        a: "The ALPS Foundation filmed and photographed the event for educational and promotional purposes. By entering the event premises and by participating in this event, attendees consented to the use of your photograph, likeness, or video or audio recording in whole or in part without restriction or limitation for any educational, promotional, or any purpose for distribution online and in printed publications or publication in other media.\n\nYou release the ALPS Foundation, their volunteers, and each and all persons involved from any liability connected with the taking, recording, digitisation, or publication of interviews, photographs, computer images, or video and/or sound recordings.\n\nWe are however happy to remove your image from any digital property over which we have control upon your request."
      }
    ]
  },
  {
    category: "After the conference",
    items: [
      {
        q: "Will recordings be available? What about previous ALPS conferences?",
        a: `Yes. The ALPS 2026 talks will be published on our [YouTube channel](${YOUTUBE_CHANNEL_URL}), where the playlists from previous editions are already online.`
      },
      {
        q: "Can I get a certificate for attending this conference?",
        a: "Yes. Email info@alps.foundation to request your certificate of participation."
      },
      {
        q: "Can I get ECTS credits for attending the conference?",
        a: "Yes. The main conference (9–10 October) was accredited for up to 14 ECTS for the FSP and 10 ECTS for the SGPP/SSPP."
      },
      {
        q: "Can I get FSP credits for the Workshop Day?",
        a: "Yes. The Workshop Day was accredited for 4 FSP credits for medical professionals and psychologists, with a certificate of attendance after the event."
      },
      {
        q: "Does the ALPS Foundation share my personal information?",
        a: "No. The ALPS Foundation keeps all personal information entered during registration confidential and secure."
      },
      {
        q: "How can I stay in touch with ALPS?",
        a: `Sign up for the newsletter on [alps.foundation](${NEWSLETTER_SIGNUP_URL}) for occasional updates on ALPS events, talks and psychedelic science in Switzerland.`
      }
    ]
  }
];

const LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

function renderAnswer(text: string) {
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = LINK_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <a
        key={match.index}
        href={match[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="text-support-light underline hover:text-white transition-colors"
      >
        {match[1]}
      </a>
    );
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

function AccordionItem({
  q,
  a,
  cta,
}: {
  q: string;
  a: string;
  cta?: { label: string; href: string };
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-white/10 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-5 flex items-center justify-between text-left focus:outline-none cursor-pointer group"
      >
        <span className="text-xl font-medium text-white pr-8 group-hover:text-support-light transition-colors">
          {q}
        </span>
        <ChevronDown
          className={`w-6 h-6 text-white/80 shrink-0 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-support-light" : ""
          }`}
        />
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? `${contentRef.current?.scrollHeight}px` : "0px",
          opacity: isOpen ? 1 : 0,
        }}
      >
        <div className="pb-6">
          <p className="text-white/80 leading-relaxed whitespace-pre-wrap text-base">
            {renderAnswer(a)}
          </p>
          {cta && (
            <a
              href={cta.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-sm bg-support hover:bg-support-light px-5 py-3 text-sm font-semibold text-white transition-colors"
            >
              {cta.label}
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate(el.querySelectorAll("[data-fade-up]"), {
            opacity: [0, 1],
            translateY: [30, 0],
            delay: (_: unknown, i: number) => i * 100,
            duration: 800,
            easing: "easeOutCubic",
          });
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="faq" className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div data-fade-up className="opacity-0 text-center mb-10 sm:mb-12">
          <p className="section-eyebrow">
            Got questions?
          </p>
          <h2 className="section-title">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-8">
          {FAQS.map((section) => (
            <div key={section.category} data-fade-up className="opacity-0">
              <h3 className="text-xl font-semibold text-support-light mb-4">
                {section.category}
              </h3>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-[1.25rem] px-5 sm:px-7">
                {section.items.map((item, idx) => (
                  <AccordionItem key={idx} q={item.q} a={item.a} cta={"cta" in item ? item.cta : undefined} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
