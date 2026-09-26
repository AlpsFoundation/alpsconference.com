import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { errorResponse, handleOwnStatus } from "../../../lib/experienceSignups";

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleOwnStatus(env.DB, request);

export const ALL: APIRoute = () => errorResponse("Method not allowed.", 405);
