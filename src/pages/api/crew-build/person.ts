import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { buildError, handleAddPerson, withCrewDb } from "../../../lib/crewBuildServer";

export const prerender = false;

export const POST: APIRoute = ({ request }) => withCrewDb(env.CREW_DB, (db) => handleAddPerson(db, request));

export const ALL: APIRoute = () => buildError("Method not allowed.", 405);
