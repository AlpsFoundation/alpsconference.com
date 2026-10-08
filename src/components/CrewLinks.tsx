import { ArrowUpRight } from "lucide-react";
import type { CrewLink } from "../data/crewLinks";
import { withBase } from "../lib/withBase";

/**
 * A row of link chips (src/data/crewLinks.ts). Every link opens in a new tab, so the
 * portal stays where the volunteer left it. Team links carry a small "Team" tag.
 */
export default function CrewLinks({ links, label, className }: { links?: CrewLink[]; label?: string; className?: string }) {
  if (!links?.length) return null;
  return (
    <ul className={className ? `vol-links ${className}` : "vol-links"} aria-label={label ?? "Links"}>
      {links.map((link) => (
        <li key={`${link.href}|${link.label}`}>
          <a
            className="vol-linkchip"
            href={link.href.startsWith("/") ? withBase(link.href) : link.href}
            target="_blank"
            rel="noopener noreferrer"
            data-team={link.team || undefined}
          >
            {link.label}
            {link.team && (
              <span className="vol-linkchip__team" title="Opens with an ALPS account">
                Team
              </span>
            )}
            <ArrowUpRight size={13} aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
