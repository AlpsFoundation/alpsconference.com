import { ArrowRight } from "lucide-react";
import { withBase } from "../lib/withBase";

// Bar above the home page navbar while the conference is on. Its height
// (--site-banner-height in app.css) also offsets the navbar, hero and anchor scrolling.
export default function AttendeeBanner() {
  return (
    <a
      href={withBase("links")}
      className="site-banner"
      aria-label="Open the attendee portal: program, venue map, wifi and experience sign-ups"
    >
      <span className="site-banner__live">
        <span className="site-banner__dot" aria-hidden="true" />
        <span className="site-banner__live-label">Live now</span>
      </span>
      <span className="site-banner__text">Program, venue map, wifi and experience sign-ups</span>
      <span className="site-banner__cta">
        Open the attendee portal
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </span>
    </a>
  );
}
