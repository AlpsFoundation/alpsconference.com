import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { buildError, handleBuildState, withCrewDb } from "../../../lib/crewBuildServer";

export const prerender = false;

export const GET: APIRoute = () => withCrewDb(env.CREW_DB, handleBuildState);

export const ALL: APIRoute = () => buildError("Method not allowed.", 405);
