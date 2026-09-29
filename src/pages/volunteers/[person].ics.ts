import type { APIRoute, GetStaticPaths } from "astro";
import { buildVolunteerCalendar } from "../../lib/volunteerIcal";
import { CREW, volunteerSlug } from "../../lib/volunteers";

/** One prerendered, subscribable feed per crew member: `/volunteers/<first-name>.ics`. */
export const getStaticPaths = (() =>
  CREW.map((name) => ({ params: { person: volunteerSlug(name) }, props: { name } }))) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props, site }) =>
  new Response(buildVolunteerCalendar(props.name as string, site), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="alps-2026-crew-${volunteerSlug(props.name as string)}.ics"`,
    },
  });
