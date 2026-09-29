import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { personBuild, type PersonBuildEntry } from "../../lib/crewBuild";
import { addedPersonForSlug, buildState } from "../../lib/crewBuildServer";
import { buildVolunteerCalendar } from "../../lib/volunteerIcal";
import { volunteerFromSlug, volunteerSlug } from "../../lib/volunteers";

/**
 * One subscribable feed per crew member: `/volunteers/<first-name>.ics`. Served on
 * demand (no longer prerendered) because it carries live build sign-ups from D1.
 */
export const prerender = false;

export const GET: APIRoute = async ({ params, site }) => {
  const slug = String(params.person ?? "").toLowerCase();
  let name = volunteerFromSlug(slug);
  let build: PersonBuildEntry[] = [];
  try {
    if (!name) name = await addedPersonForSlug(env.CREW_DB, slug);
    if (name) build = personBuild(await buildState(env.CREW_DB), name);
  } catch (error) {
    // Build database unavailable: the plan's shifts still go out.
    console.error("crew feed: build sign-ups unavailable", error);
  }
  if (!name) return new Response("Not found", { status: 404 });
  return new Response(buildVolunteerCalendar(name, site, new Date(), build), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="alps-2026-crew-${volunteerSlug(name)}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  });
};
