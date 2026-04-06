import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const NAV_ITEMS = [
  { label: "Conference", href: "#conference" },
  { label: "Location", href: "#location" },
  // { label: "Speakers", href: "#speakers" },
  // { label: "Experiences", href: "#experiences" },
  // { label: "Research Poster", href: "#research" },
  // { label: "Sponsoring", href: "#sponsoring" },
  { label: "FAQ", href: "#faq" },
];

const PAST_EDITIONS = [
  { label: "2025", href: "https://alps2025.alpsconference.com" },
  { label: "2024", href: "https://alps2024.alpsconference.com" },
  { label: "2023", href: "https://alps2023.alpsconference.com" },
  { label: "2022", href: "https://alps2022.alpsconference.com" },
  { label: "2021", href: "https://alps2021.alpsconference.com" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [pastEditionsOpen, setPastEditionsOpen] = useState(false);
  const [mobilePastOpen, setMobilePastOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-neutral-dark/90 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-primary/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href="#" className="flex items-center gap-3 shrink-0">
              <img
                src="/img/logo.png"
                alt="ALPS Research Conference"
                className="h-8 lg:h-10 w-auto"
              />
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 rounded-sm hover:bg-white/5"
                >
                  {item.label}
                </a>
              ))}

              {/* Past Editions dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setPastEditionsOpen(true)}
                onMouseLeave={() => setPastEditionsOpen(false)}
              >
                <button className="flex items-center gap-1 px-4 py-2 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 rounded-sm hover:bg-white/5 cursor-pointer">
                  Past Editions
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${pastEditionsOpen ? "rotate-180" : ""}`} />
                </button>
                {pastEditionsOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-neutral-dark/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl overflow-hidden py-2">
                    {PAST_EDITIONS.map((ed) => (
                      <a
                        key={ed.label}
                        href={ed.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-5 py-2.5 text-base font-medium text-white/90 hover:text-white hover:bg-white/5 transition-colors"
                      >
                        ALPS {ed.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <a
                href="https://alps-foundation.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 px-5 py-2.5 text-base font-medium text-white bg-support/20 hover:bg-support/30 border border-support/30 rounded-sm transition-colors duration-200"
              >
                ALPS Foundation
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white/90 hover:text-white transition-colors cursor-pointer rounded-sm hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
        <div
          className={`absolute top-0 right-0 h-full w-72 bg-neutral-dark/98 backdrop-blur-2xl border-l border-white/5 transform transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col pt-24 px-6">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="py-4 text-xl font-medium text-white/90 hover:text-white border-b border-white/5 transition-colors"
              >
                {item.label}
              </a>
            ))}

            {/* Mobile past editions */}
            <button
              onClick={() => setMobilePastOpen(!mobilePastOpen)}
              className="flex items-center justify-between py-4 text-xl font-medium text-white/90 hover:text-white border-b border-white/5 transition-colors cursor-pointer"
            >
              Past Editions
              <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${mobilePastOpen ? "rotate-180" : ""}`} />
            </button>
            {mobilePastOpen && (
              <div className="pl-4 border-b border-white/5 py-2 bg-white/[0.02] rounded-b-sm">
                {PAST_EDITIONS.map((ed) => (
                  <a
                    key={ed.label}
                    href={ed.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-2.5 text-base font-medium text-white/80 hover:text-white transition-colors"
                  >
                    ALPS {ed.label}
                  </a>
                ))}
              </div>
            )}

            <a
              href="https://alps-foundation.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 px-6 py-3.5 text-center text-base font-medium text-white bg-support/20 hover:bg-support/30 border border-support/30 rounded-sm transition-colors"
            >
              ALPS Foundation
            </a>
          </div>
        </div>
      </div>
    </>
  );
}