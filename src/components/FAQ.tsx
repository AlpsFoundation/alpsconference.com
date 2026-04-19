import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { animate } from "animejs";

const FAQS = [
  {
    category: "Before the Event",
    items: [
      {
        q: "When will tickets go on sale?",
        a: "Tickets will go on sale on April 19, 2026 at 8pm CET."
      },
      {
        q: "Can my ticket be refunded?",
        a: "We have a no-refund policy. However, you can transfer your ticket to another person before the conference. Please note that the ALPS Foundation is a non-profit organization, operated entirely by unpaid volunteers and sustained through donations. Additionally, our ticketing partner Infomaniak offers a cancellation insurance in partnership Allianz; please refer to their terms and conditions."
      },
      {
        q: "Who is eligible for the reduced ticket?",
        a: "Students currently enrolled in any official college or university are eligible for the ALPS Conference 2025 Student Ticket. Please bring proof, such as a student card on the day of the event."
      },
      {
        q: "I only want to attend one day of the conference, is that possible?",
        a: "Tickets are only available for the full length of the conference, two days."
      }
    ]
  },
  {
    category: "During the Event",
    items: [
      {
        q: "What is included in my ticket?",
        a: "Tickets include entry to the conference for both days, featuring 16 speakers, poster presentations, a networking apéro, and an afterparty. Attendees will enjoy snacks and coffee/tea during morning and afternoon breaks. Additionally, lunch will be provided on Friday, and on Saturday, lunch and food/refreshments will be available during the networking apéro."
      },
      {
        q: "What food will be served during the conference?",
        a: "We serve mainly Vegetarian Food with Vegan options during Lunch and the Networking Apero. Snacks during breaks will be Vegetarian."
      },
      {
        q: "Where can I find information about the location?",
        a: "The conference will be held at Kultur & Kongresshaus Aarau. For more information, visit: https://www.kuk-aarau.ch/"
      },
      {
        q: "Will the event be streamed live?",
        a: "No, however all sessions are recorded and will be available on our YouTube Channel."
      },
      {
        q: "What is the working language of the conference?",
        a: "The working language of the conference is English."
      },
      {
        q: "What is the dress code for the event?",
        a: "There is no dress code for the event. We ourselves wear whatever we would wear at an academic conference."
      },
      {
        q: "Are there volunteering opportunities for this event?",
        a: "Yes. Keep an eye out for the announcement on our Instagram to find out when we open our volunteering application form."
      },
      {
        q: "What services are available for participants with special needs?",
        a: "Kultur & Kongresshaus Aarau is wheelchair accessible. Please reach out to us if you have any special needs."
      },
      {
        q: "Will there be photo and video recording at the event?",
        a: "The ALPS Foundation shoots video and pictures of the event for educational and promotional purposes. By entering the event premises and by participation in this event, you consent to the use of your photograph, likeness, or video or audio recording in whole or in part without restriction or limitation for any educational, promotional, or any purpose for distribution online and in printed publications or publication in other media.\n\nYou release the ALPS Foundation, their volunteers, and each and all persons involved from any liability connected with the taking, recording, digitisation, or publication of interviews, photographs, computer images, or video and/or sound recordings.\n\nWe are however happy to remove your image from any digital property over which we have control upon your request."
      }
    ]
  },
  {
    category: "After the Event",
    items: [
      {
        q: "Will recordings be available for later viewing? What about previous ALPS conferences?",
        a: "Absolutely, check out our playlists from previous editions on YouTube."
      },
      {
        q: "Can I get a certificate for attending this conference?",
        a: "Yes, a certificate of participation will be made available a few days after the conference. Please send an email after the conference at info@alps.foundation"
      },
      {
        q: "Can I get ETCS credits for attending this conference?",
        a: "Yes, up to 14 ETCS for the FSP and 8 ECTS for the SGPP/SSPP"
      },
      {
        q: "Does the ALPS Foundation share my personal information?",
        a: "No. The ALPS Foundation keeps all personal information entered during registration confidential and secure."
      }
    ]
  }
];

function AccordionItem({ q, a }: { q: string; a: string }) {
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
            {a}
          </p>
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
        <div data-fade-up className="opacity-0 text-center mb-16">
          <p className="text-base tracking-[0.2em] uppercase text-support-light font-medium mb-3">
            Got questions?
          </p>
          <h2 className="text-3xl font-semibold text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-12">
          {FAQS.map((section) => (
            <div key={section.category} data-fade-up className="opacity-0">
              <h3 className="text-xl font-semibold text-support-light mb-4">
                {section.category}
              </h3>
              <div className="bg-white/[0.02] border border-white/[0.05] rounded-sm p-6 sm:p-8">
                {section.items.map((item, idx) => (
                  <AccordionItem key={idx} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
