import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
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

export const POST: APIRoute = ({ request }) => handleSignup(env.DB, request);

export const DELETE: APIRoute = ({ request }) => handleCancel(env.DB, request);

export const ALL: APIRoute = () => errorResponse("Method not allowed.", 405);
