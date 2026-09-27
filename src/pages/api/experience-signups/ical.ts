import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { errorResponse, handleIcalDownload } from "../../../lib/experienceSignups";

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleIcalDownload(env.DB, request);

export const ALL: APIRoute = () => errorResponse("Method not allowed.", 405);
