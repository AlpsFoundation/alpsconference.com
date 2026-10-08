import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/bookingMailer", () => ({ sendBookingEmail: vi.fn(async () => {}) }));

import { EXPERIENCE_SESSIONS } from "../src/data/conferenceTimeline";
import { sendBookingEmail } from "../src/lib/bookingMailer";
import { handleCancel, handleSignup, type SignupResult } from "../src/lib/experienceSignups";
import { fakeD1 } from "./support/fakeD1";

const session = EXPERIENCE_SESSIONS.find((s) => s.signup)!;
const sent = vi.mocked(sendBookingEmail);

let env: { DB: D1Database };
let pending: Promise<unknown>[];
const waitUntil = (promise: Promise<unknown>) => void pending.push(promise);

async function signUp(n: number, query = "") {
  const response = await handleSignup(
    env,
    new Request(`https://alpsconference.com/api/experience-signups${query}`, {
      method: "POST",
      body: JSON.stringify({ experienceId: session.id, fullName: `Person ${n}`, email: `person${n}@example.com` }),
    }),
    waitUntil,
  );
  await Promise.all(pending);
  return { response, data: (await response.json()) as SignupResult & { cancelToken: string; error?: string } };
}

async function cancel(cancelToken: string) {
  const response = await handleCancel(
    env,
    new Request("https://alpsconference.com/api/experience-signups", {
      method: "DELETE",
      body: JSON.stringify({ cancelToken }),
    }),
    waitUntil,
  );
  await Promise.all(pending);
  return response;
}

beforeEach(() => {
  env = { DB: fakeD1() };
  pending = [];
  sent.mockClear();
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-10-09T09:00:00+02:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("experience sign-ups", () => {
  it("stay closed until Friday 9 October unless ?time moves the clock", async () => {
    vi.setSystemTime(new Date("2026-10-08T23:59:00+02:00"));

    const early = await signUp(1);
    expect(early.response.status).toBe(403);
    expect(early.data.error).toBe("Sign-ups open on Friday 9 October.");
    expect(sent).not.toHaveBeenCalled();

    const stillEarly = await signUp(1, "?time=2026-10-08-23-59");
    expect(stillEarly.response.status).toBe(403);

    const travelled = await signUp(1, "?time=2026-10-09-00-00");
    expect(travelled.response.status).toBe(201);
    expect(travelled.data.status).toBe("confirmed");
    expect(sent).toHaveBeenCalledOnce();
    expect(sent.mock.calls[0][1]).toMatchObject({ to: "person1@example.com" });
    expect(sent.mock.calls[0][1].subject).toContain("You're in");
    expect(sent.mock.calls[0][1].attachments?.[0].filename).toMatch(/\.ics$/);
  });

  it("close once the session has started", async () => {
    vi.setSystemTime(session.start!);
    const { response } = await signUp(1);
    expect(response.status).toBe(409);
  });

  it("email the first person on the waitlist when a confirmed spot is cancelled", async () => {
    const first = await signUp(1);
    for (let n = 2; n <= session.capacity; n++) await signUp(n);
    const waitlisted = await signUp(session.capacity + 1);
    expect(waitlisted.data).toMatchObject({ status: "waitlist", waitlistPosition: 1 });
    sent.mockClear();

    expect((await cancel(first.data.cancelToken)).status).toBe(200);

    expect(sent).toHaveBeenCalledOnce();
    expect(sent.mock.calls[0][1].to).toBe(`person${session.capacity + 1}@example.com`);
    expect(sent.mock.calls[0][1].subject).toContain("A spot opened up");
  });

  it("promote nobody when a waitlist spot is cancelled", async () => {
    for (let n = 1; n <= session.capacity; n++) await signUp(n);
    const waitlisted = await signUp(session.capacity + 1);
    sent.mockClear();

    expect((await cancel(waitlisted.data.cancelToken)).status).toBe(200);
    expect(sent).not.toHaveBeenCalled();
  });
});
