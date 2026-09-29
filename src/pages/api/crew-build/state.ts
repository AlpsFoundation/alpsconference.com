import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { buildError, handleBuildState } from "../../../lib/crewBuildServer";

export const prerender = false;

export const GET: APIRoute = () => handleBuildState(env.CREW_DB);

export const ALL: APIRoute = () => buildError("Method not allowed.", 405);
