import type { APIRoute } from "astro";
import { env, waitUntil } from "cloudflare:workers";
import {
  errorResponse,
  getAvailability,
  handleCancel,
  handleSignup,
  json,
} from "../../../lib/experienceSignups";

export const prerender = false;

export const GET: APIRoute = async () =>
  json({ availability: await getAvailability(env.DB) });

/** Always answer with JSON, so the client never has to parse an HTML error page. */
async function safely(label: string, run: () => Promise<Response>): Promise<Response> {
  try {
    return await run();
  } catch (error) {
    console.error(`experience signup ${label} failed`, error);
    return errorResponse("Something went wrong on our side, please try again in a moment.", 500);
  }
}

export const POST: APIRoute = ({ request }) => safely("create", () => handleSignup(env, request, waitUntil));

export const DELETE: APIRoute = ({ request }) => safely("cancel", () => handleCancel(env, request, waitUntil));

export const ALL: APIRoute = () => errorResponse("Method not allowed.", 405);
