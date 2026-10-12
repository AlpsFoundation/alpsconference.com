export type NewsletterRuntimeEnv = {
  INFOMANIAK_TOKEN?: string;
  INFOMANIAK_NEWSLETTER_DOMAIN?: string;
  INFOMANIAK_NEWSLETTER_GROUPS?: string;
  NEWSLETTER_DEBUG?: string;
};

type JsonResponse = {
  ok: boolean;
  error?: string;
  debug?: Record<string, unknown>;
};

type HandleNewsletterSubscribeParams = {
  request: Pick<Request, "text" | "method">;
  env: NewsletterRuntimeEnv;
  fetchImpl?: typeof fetch;
};

export function createOptionsResponse() {
  return new Response(null, {
    status: 204,
    headers: defaultHeaders(),
  });
}

export function createMethodNotAllowedResponse(method: string) {
  return jsonResponse(
    405,
    { ok: false, error: "Method not allowed" },
    {
      reason: "method_not_allowed",
      method,
    },
    {}
  );
}

export async function handleNewsletterSubscribe({
  request,
  env,
  fetchImpl = fetch,
}: HandleNewsletterSubscribeParams) {
  const token = env.INFOMANIAK_TOKEN?.trim() ?? "";
  const domain = env.INFOMANIAK_NEWSLETTER_DOMAIN?.trim() ?? "";
  const groupsRaw = env.INFOMANIAK_NEWSLETTER_GROUPS?.trim() ?? "";

  if (!token || !domain) {
    return jsonResponse(
      500,
      { ok: false, error: "Server configuration is incomplete" },
      {
        reason: "missing_env",
        has_token: Boolean(token),
        has_domain: Boolean(domain),
      },
      env
    );
  }

  if (!/^\d+$/.test(domain)) {
    return jsonResponse(
      500,
      { ok: false, error: "Invalid newsletter domain configuration" },
      {
        reason: "invalid_domain_format",
      },
      env
    );
  }

  const body = await request.text();
  let data: unknown;

  try {
    data = JSON.parse(body);
  } catch {
    return jsonResponse(
      400,
      { ok: false, error: "Invalid JSON body" },
      {
        reason: "invalid_json",
        body_length: body.length,
      },
      env
    );
  }

  const email = getEmailFromPayload(data);

  if (!isValidEmail(email)) {
    return jsonResponse(
      400,
      { ok: false, error: "Please enter a valid email address" },
      {
        reason: "invalid_email",
      },
      env
    );
  }

  const payload: {
    email: string;
    fields?: { firstname?: string; lastname?: string };
    groups?: Array<number | string>;
  } = { email };
  const nameFields = splitName(getNameFromPayload(data));

  if (nameFields.firstname) {
    payload.fields = nameFields;
  }
  const groups = parseGroups(groupsRaw);

  if (groups.length > 0) {
    payload.groups = groups;
  }

  let upstreamResponse: Response;

  try {
    upstreamResponse = await fetchImpl(
      `https://api.infomaniak.com/1/newsletters/${encodeURIComponent(domain)}/subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );
  } catch (error) {
    return jsonResponse(
      502,
      {
        ok: false,
        error: "Could not reach newsletter service. Try again later.",
      },
      {
        reason: "fetch_failed",
        message: error instanceof Error ? error.message : "Unknown fetch error",
      },
      env
    );
  }

  const responseText = await upstreamResponse.text();
  const decoded = parseJson(responseText);
  const result =
    decoded && typeof decoded === "object" && "result" in decoded
      ? String(decoded.result)
      : "";

  const infomaniakOk =
    decoded &&
    typeof decoded === "object" &&
    (result === "success" || result === "asynchronous") &&
    (upstreamResponse.status === 200 || upstreamResponse.status === 201);

  if (infomaniakOk) {
    return jsonResponse(200, { ok: true }, undefined, env);
  }

  const message =
    extractErrorMessage(decoded) ?? "Subscription could not be completed.";
  const outStatus =
    upstreamResponse.status >= 400 && upstreamResponse.status < 600
      ? upstreamResponse.status
      : 502;

  return jsonResponse(
    outStatus,
    { ok: false, error: message },
    {
      reason: "infomaniak_api_error",
      http_status: upstreamResponse.status,
      api_result: result || null,
      response_snippet: truncate(responseText, 800),
    },
    env
  );
}

function defaultHeaders() {
  return {
    "Content-Type": "application/json; charset=utf-8",
  };
}

function getEmailFromPayload(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "email" in data &&
    typeof data.email === "string"
  ) {
    return data.email.trim();
  }

  return "";
}

// One "Name and surname" field, split like alps.foundation's signup: the first
// word is the first name, the rest the last name (Infomaniak's standard fields).
function getNameFromPayload(data: unknown) {
  if (
    typeof data === "object" &&
    data !== null &&
    "name" in data &&
    typeof data.name === "string"
  ) {
    return data.name.trim().slice(0, 200);
  }

  return "";
}

function splitName(name: string): { firstname?: string; lastname?: string } {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { firstname: parts[0] };
  return { firstname: parts[0], lastname: parts.slice(1).join(" ") };
}

function parseGroups(groupsRaw: string): Array<number | string> {
  return groupsRaw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (/^\d+$/.test(value) ? Number(value) : value));
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractErrorMessage(decoded: unknown): string | null {
  if (!decoded || typeof decoded !== "object") {
    return null;
  }

  if (
    "error" in decoded &&
    decoded.error &&
    typeof decoded.error === "object" &&
    "description" in decoded.error &&
    typeof decoded.error.description === "string"
  ) {
    return decoded.error.description;
  }

  if ("message" in decoded && typeof decoded.message === "string") {
    return decoded.message;
  }

  return null;
}

function truncate(value: string, max: number) {
  if (value.length <= max) {
    return value;
  }

  return `${value.slice(0, max)}…`;
}

function debugEnabled(env: NewsletterRuntimeEnv) {
  const value = env.NEWSLETTER_DEBUG?.trim().toLowerCase() ?? "";
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function jsonResponse(
  status: number,
  data: JsonResponse,
  debug: Record<string, unknown> | undefined,
  env: NewsletterRuntimeEnv
) {
  const payload =
    debug && debugEnabled(env)
      ? {
          ...data,
          debug,
        }
      : data;

  return new Response(JSON.stringify(payload), {
    status,
    headers: defaultHeaders(),
  });
}
