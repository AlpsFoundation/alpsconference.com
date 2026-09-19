import type { APIRoute } from "astro";
import { buildCalendar, CALENDAR_FILES } from "../lib/ical";

/** Prerendered subscribable feed: regenerated from `src/data/experiences.ts` on every build. */
export const GET: APIRoute = ({ site }) =>
  new Response(buildCalendar("experiences", site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${CALENDAR_FILES.experiences}"`,
    },
  });
