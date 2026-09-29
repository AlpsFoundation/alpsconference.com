import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { buildError, handleAddPerson } from "../../../lib/crewBuildServer";

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleAddPerson(env.CREW_DB, request);

export const ALL: APIRoute = () => buildError("Method not allowed.", 405);
