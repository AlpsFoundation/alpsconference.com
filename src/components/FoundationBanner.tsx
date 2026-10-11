import { ArrowUpRight } from "lucide-react";
import { FOUNDATION_URL } from "../data/postConference";

// Bar above the home page navbar now that the conference is over. Its height
// (--site-banner-height in app.css) also offsets the navbar, hero and anchor scrolling.
export default function FoundationBanner() {
  return (
    <a
      href={FOUNDATION_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="site-banner"
      aria-label="More from ALPS Foundation: events, talks and news on alps.foundation"
    >
      <span className="site-banner__text">ALPS Conference 2026 took place on 9–10 October in Aarau. Thank you.</span>
      <span className="site-banner__cta">
        More from ALPS Foundation
        <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </span>
    </a>
  );
}
