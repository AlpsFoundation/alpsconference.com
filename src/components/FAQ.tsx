import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { animate } from "animejs";
import { useTranslation } from "../lib/i18n";

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
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  const FAQS = [
    {
      category: t.faq.categories.before,
      items: [
        { q: t.faq.items.ticketSaleQ, a: t.faq.items.ticketSaleA },
        { q: t.faq.items.refundQ, a: t.faq.items.refundA },
        { q: t.faq.items.reducedQ, a: t.faq.items.reducedA },
        { q: t.faq.items.oneDayQ, a: t.faq.items.oneDayA },
      ],
    },
    {
      category: t.faq.categories.during,
      items: [
        { q: t.faq.items.includedQ, a: t.faq.items.includedA },
        { q: t.faq.items.foodQ, a: t.faq.items.foodA },
        { q: t.faq.items.locationQ, a: t.faq.items.locationA },
        { q: t.faq.items.streamQ, a: t.faq.items.streamA },
        { q: t.faq.items.languageQ, a: t.faq.items.languageA },
        { q: t.faq.items.dressQ, a: t.faq.items.dressA },
        { q: t.faq.items.volunteerQ, a: t.faq.items.volunteerA },
        { q: t.faq.items.accessibilityQ, a: t.faq.items.accessibilityA },
        { q: t.faq.items.childcareQ, a: t.faq.items.childcareA },
        { q: t.faq.items.photoQ, a: t.faq.items.photoA },
      ],
    },
    {
      category: t.faq.categories.after,
      items: [
        { q: t.faq.items.recordingsQ, a: t.faq.items.recordingsA },
        { q: t.faq.items.certificateQ, a: t.faq.items.certificateA },
        { q: t.faq.items.ectsQ, a: t.faq.items.ectsA },
        { q: t.faq.items.privacyQ, a: t.faq.items.privacyA },
      ],
    },
  ];

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
            {t.faq.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold text-white">
            {t.faq.heading}
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
