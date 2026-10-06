import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { buildError, handleAssign, withCrewDb } from "../../../lib/crewBuildServer";

export const prerender = false;

export const POST: APIRoute = ({ request }) => withCrewDb(env.CREW_DB, (db) => handleAssign(db, request));

export const ALL: APIRoute = () => buildError("Method not allowed.", 405);
