import { describe, expect, it } from "vitest";
import {
  createMethodNotAllowedResponse,
  createOptionsResponse,
  handleNewsletterSubscribe,
} from "../src/lib/newsletterSignup";

describe("newsletter signup handler", () => {
  it("returns 204 for OPTIONS requests", async () => {
    const response = createOptionsResponse();

    expect(response.status).toBe(204);
  });

  it("returns 405 for unsupported methods", async () => {
    const response = createMethodNotAllowedResponse("GET");
    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(405);
    expect(payload).toEqual({
      ok: false,
      error: "Method not allowed",
    });
  });

  it("rejects missing runtime configuration", async () => {
    const response = await handleNewsletterSubscribe({
      request: new Request("https://example.com/api/newsletter-subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
      env: {},
    });

    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Server configuration is incomplete");
  });

  it("validates malformed request bodies", async () => {
    const response = await handleNewsletterSubscribe({
      request: new Request("https://example.com/api/newsletter-subscribe", {
        method: "POST",
        body: "{invalid",
      }),
      env: {
        INFOMANIAK_TOKEN: "token",
        INFOMANIAK_NEWSLETTER_DOMAIN: "123",
      },
    });

    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid JSON body");
  });

  it("validates email addresses before calling Infomaniak", async () => {
    let called = false;

    const response = await handleNewsletterSubscribe({
      request: new Request("https://example.com/api/newsletter-subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "not-an-email" }),
      }),
      env: {
        INFOMANIAK_TOKEN: "token",
        INFOMANIAK_NEWSLETTER_DOMAIN: "123",
      },
      fetchImpl: async () => {
        called = true;
        return new Response();
      },
    });

    const payload = (await response.json()) as { ok: boolean; error: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Please enter a valid email address");
    expect(called).toBe(false);
  });

  it("returns success for accepted Infomaniak responses", async () => {
    let requestBody = "";
    let authHeader = "";
    let requestUrl = "";

    const response = await handleNewsletterSubscribe({
      request: new Request("https://example.com/api/newsletter-subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
      env: {
        INFOMANIAK_TOKEN: "token",
        INFOMANIAK_NEWSLETTER_DOMAIN: "123",
        INFOMANIAK_NEWSLETTER_GROUPS: "456,Researchers",
      },
      fetchImpl: async (input, init) => {
        requestUrl = String(input);
        requestBody = String(init?.body ?? "");
        authHeader = String((init?.headers as Record<string, string>)?.Authorization ?? "");

        return new Response(JSON.stringify({ result: "success" }), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    });

    const payload = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(payload).toEqual({ ok: true });
    expect(requestUrl).toBe(
      "https://api.infomaniak.com/1/newsletters/123/subscribers"
    );
    expect(authHeader).toBe("Bearer token");
    expect(JSON.parse(requestBody)).toEqual({
      email: "person@example.com",
      groups: [456, "Researchers"],
    });
  });

  it("surfaces upstream API errors", async () => {
    const response = await handleNewsletterSubscribe({
      request: new Request("https://example.com/api/newsletter-subscribe", {
        method: "POST",
        body: JSON.stringify({ email: "person@example.com" }),
      }),
      env: {
        INFOMANIAK_TOKEN: "token",
        INFOMANIAK_NEWSLETTER_DOMAIN: "123",
        NEWSLETTER_DEBUG: "1",
      },
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            error: {
              description: "Already subscribed",
            },
          }),
          {
            status: 409,
            headers: {
              "Content-Type": "application/json",
            },
          }
        ),
    });

    const payload = (await response.json()) as {
      ok: boolean;
      error: string;
      debug?: { reason?: string };
    };

    expect(response.status).toBe(409);
    expect(payload.error).toBe("Already subscribed");
    expect(payload.debug?.reason).toBe("infomaniak_api_error");
  });
});
