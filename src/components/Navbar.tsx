import { useState, useEffect } from "react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { withBase } from "../lib/withBase";

type MenuKey = "conference" | "participate" | "past";

type NavLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

const CONFERENCE_LINKS: NavLink[] = [
  { label: "Tickets", href: "/#tickets", description: "Reserve your place" },
  { label: "Conference", href: "/#about", description: "Theme, dates, and overview" },
  { label: "Location", href: "/#location", description: "Venue and travel details" },
  { label: "FAQ", href: "/#faq", description: "Practical information" },
  { label: "Partners", href: "/#partners", description: "Sponsors and collaborators" },
];

const PARTICIPATE_LINKS: NavLink[] = [
  { label: "Call for Speakers", href: "/speaker", description: "Apply to present a talk" },
  { label: "Research Poster", href: "/poster", description: "Submit a poster proposal" },
];

const PAST_EDITIONS: NavLink[] = [
  { label: "ALPS 2025", href: "https://sites.google.com/view/alps-conference-2025", external: true },
  { label: "ALPS 2024", href: "https://sites.google.com/view/alps-conference-2024", external: true },
  { label: "ALPS 2023", href: "https://sites.google.com/view/alps-conference-2023", external: true },
  { label: "ALPS 2022", href: "https://sites.google.com/view/alpsconference2022/home", external: true },
  { label: "ALPS 2021", href: "https://sites.google.com/view/pala-psychedelics-congress/home", external: true },
];

const FOUNDATION_URL = "https://www.alps.foundation/";

function linkHref(item: NavLink) {
  return item.external ? item.href : withBase(item.href);
}

function DesktopDropdown({
  label,
  eyebrow,
  menuKey,
  items,
  openMenu,
  setOpenMenu,
  align = "left",
}: {
  label: string;
  eyebrow: string;
  menuKey: MenuKey;
  items: NavLink[];
  openMenu: MenuKey | null;
  setOpenMenu: (menu: MenuKey | null) => void;
  align?: "left" | "right";
}) {
  const isOpen = openMenu === menuKey;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpenMenu(menuKey)}
      onMouseLeave={() => setOpenMenu(null)}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setOpenMenu(isOpen ? null : menuKey)}
        className="flex items-center gap-1.5 px-4 py-2.5 text-base font-medium text-white/90 hover:text-white transition-colors duration-200 rounded-sm hover:bg-white/5 cursor-pointer"
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className={`absolute top-full ${align === "right" ? "right-0" : "left-0"} pt-3`}>
          <div className="w-72 bg-neutral-dark/95 backdrop-blur-xl border border-white/10 rounded-sm shadow-2xl overflow-hidden p-2">
            <p className="px-3 pt-2 pb-1 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-support-light/80">
              {eyebrow}
            </p>
            {items.map((item) => (
              <a
                key={item.href}
                href={linkHref(item)}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="group flex items-start justify-between gap-3 rounded-sm px-3 py-3 text-white/90 hover:text-white hover:bg-white/5 transition-colors"
              >
                <span>
                  <span className="block text-base font-medium">{item.label}</span>
                  {item.description && (
                    <span className="block mt-0.5 text-sm font-normal leading-snug text-white/50 group-hover:text-white/65">
                      {item.description}
                    </span>
                  )}
                </span>
                {item.external && <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-white/40 group-hover:text-white/70" />}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MobileLinkGroup({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: NavLink[];
  onNavigate: () => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-support-light/80">
        {title}
      </p>
      <div className="divide-y divide-white/5 border-y border-white/5">
        {items.map((item) => (
          <a
            key={item.href}
            href={linkHref(item)}
            target={item.external ? "_blank" : undefined}
            rel={item.external ? "noopener noreferrer" : undefined}
            onClick={onNavigate}
            className="group flex items-center justify-between gap-3 py-3.5 text-white/90 hover:text-white transition-colors"
          >
            <span>
              <span className="block text-lg font-medium">{item.label}</span>
              {item.description && <span className="block text-sm text-white/50">{item.description}</span>}
            </span>
            {item.external && <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white/70" />}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    if (!openMenu) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openMenu]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b [will-change:backdrop-filter] transition-[background-color,border-color,box-shadow] duration-500 ${
          scrolled
            ? "bg-neutral-dark/90 backdrop-blur-xl border-white/5 shadow-2xl shadow-primary/10"
            : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <a href={withBase("/")} className="flex items-center gap-3 shrink-0">
              <img
                src={withBase("img/logo.png")}
                alt="ALPS Research Conference"
                className="h-8 lg:h-10 w-auto"
              />
            </a>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-2">
              <DesktopDropdown
                label="Conference"
                eyebrow="Home sections"
                menuKey="conference"
                items={CONFERENCE_LINKS}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
              <DesktopDropdown
                label="Participate"
                eyebrow="Separate pages"
                menuKey="participate"
                items={PARTICIPATE_LINKS}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
              />
              <DesktopDropdown
                label="Past editions"
                eyebrow="Archive"
                menuKey="past"
                items={PAST_EDITIONS}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                align="right"
              />

              <a
                href={FOUNDATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 flex items-center gap-1.5 px-5 py-2.5 text-base font-medium text-white bg-support/20 hover:bg-support/30 border border-support/30 rounded-sm transition-colors duration-200"
              >
                ALPS Foundation
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
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
          <div className="flex h-full flex-col gap-8 overflow-y-auto pt-24 px-6 pb-8">
            <MobileLinkGroup title="Home sections" items={CONFERENCE_LINKS} onNavigate={() => setIsOpen(false)} />
            <MobileLinkGroup title="Separate pages" items={PARTICIPATE_LINKS} onNavigate={() => setIsOpen(false)} />
            <MobileLinkGroup title="Archive" items={PAST_EDITIONS} onNavigate={() => setIsOpen(false)} />

            <a
              href={FOUNDATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-1.5 px-6 py-3.5 text-center text-base font-medium text-white bg-support/20 hover:bg-support/30 border border-support/30 rounded-sm transition-colors"
            >
              ALPS Foundation
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
