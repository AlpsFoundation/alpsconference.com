import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { errorResponse, handleBookingLookup } from "../../../lib/experienceSignups";

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleBookingLookup(env.DB, request);

export const ALL: APIRoute = () => errorResponse("Method not allowed.", 405);
