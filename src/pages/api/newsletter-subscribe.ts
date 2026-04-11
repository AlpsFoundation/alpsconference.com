import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import {
  createMethodNotAllowedResponse,
  createOptionsResponse,
  handleNewsletterSubscribe,
} from "../../lib/newsletterSignup";

export const prerender = false;

export const OPTIONS: APIRoute = () => createOptionsResponse();

export const POST: APIRoute = ({ request }) =>
  handleNewsletterSubscribe({ request, env });

export const ALL: APIRoute = ({ request }) =>
  createMethodNotAllowedResponse(request.method);
