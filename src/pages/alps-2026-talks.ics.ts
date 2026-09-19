import type { APIRoute } from "astro";
import { buildCalendar, CALENDAR_FILES } from "../lib/ical";

/** Prerendered subscribable feed: regenerated from `src/data/program.ts` on every build. */
export const GET: APIRoute = ({ site }) =>
  new Response(buildCalendar("talks", site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${CALENDAR_FILES.talks}"`,
    },
  });
