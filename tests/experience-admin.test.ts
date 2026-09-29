import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../src/lib/bookingMailer", () => ({ sendBookingEmail: vi.fn(async () => {}) }));

import { EXPERIENCE_SESSIONS } from "../src/data/conferenceTimeline";
import { sendBookingEmail } from "../src/lib/bookingMailer";
import { addBooking, getSession, listSessions, removeBooking, setCheckedIn } from "../src/lib/experienceAdmin";
import { fakeD1 } from "./support/fakeD1";

const session = EXPERIENCE_SESSIONS.find((s) => s.signup)!;
const sent = vi.mocked(sendBookingEmail);
const ORIGIN = "https://alpsconference.com";

let env: { DB: D1Database };
let pending: Promise<unknown>[];
const waitUntil = (promise: Promise<unknown>) => void pending.push(promise);

async function add(fullName: string, email?: string) {
  const result = await addBooking(env, ORIGIN, { experienceId: session.id, fullName, email, addedBy: "staff@alps.foundation" }, waitUntil);
  await Promise.all(pending);
  return result;
}

beforeEach(() => {
  env = { DB: fakeD1() };
  pending = [];
  sent.mockClear();
});

describe("staff booking tools", () => {
  it("list every bookable session in time order, booked or not", async () => {
    const sessions = await listSessions(env.DB);
    const bookable = EXPERIENCE_SESSIONS.filter((s) => s.signup);
    expect(sessions.map((s) => s.id).sort()).toEqual(bookable.map((s) => s.id).sort());
    const starts = sessions.map((s) => s.start!);
    expect(starts).toEqual([...starts].sort());
    expect(sessions.find((s) => s.id === session.id)).toMatchObject({ title: session.title, capacity: session.capacity, bookings: [] });
  });

  it("add people at the desk, emailing only those who give an address", async () => {
    expect(await add("Walk In")).toMatchObject({ ok: true, status: "confirmed" });
    expect(await add("Second Walk In")).toMatchObject({ ok: true, status: "confirmed" });
    expect(sent).not.toHaveBeenCalled();

    expect(await add("Ada Example", "ada@example.com")).toMatchObject({ ok: true, status: "confirmed" });
    expect(sent).toHaveBeenCalledOnce();
    expect(sent.mock.calls[0][1]).toMatchObject({ to: "ada@example.com" });

    expect(await add("Ada Again", "ADA@example.com")).toMatchObject({ ok: false });
    expect(await add("   ")).toMatchObject({ ok: false });
    expect(await add("Bad Email", "not-an-email")).toMatchObject({ ok: false });

    const { bookings } = (await getSession(env.DB, session.id))!;
    expect(bookings.map((b) => [b.fullName, b.addedBy])).toEqual([
      ["Walk In", "staff@alps.foundation"],
      ["Second Walk In", "staff@alps.foundation"],
      ["Ada Example", "staff@alps.foundation"],
    ]);
  });

  it("put desk bookings on the waitlist once the session is full", async () => {
    for (let n = 1; n <= session.capacity; n++) await add(`Person ${n}`);
    expect(await add("One Too Many")).toMatchObject({ ok: true, status: "waitlist", waitlistPosition: 1 });
  });

  it("remove a confirmed booking and email whoever moves up", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-10-08T10:00:00+02:00"));
    try {
      const first = await add("Person 1", "person1@example.com");
      for (let n = 2; n <= session.capacity; n++) await add(`Person ${n}`);
      await add("Waiting", "waiting@example.com");
      sent.mockClear();

      expect(await removeBooking(env, ORIGIN, first.ok ? first.signupId : 0, waitUntil)).toEqual({ ok: true });
      await Promise.all(pending);
      expect(sent).toHaveBeenCalledOnce();
      expect(sent.mock.calls[0][1].to).toBe("waiting@example.com");
      expect(sent.mock.calls[0][1].html).toContain("https://alpsconference.com/links/cancel?token=");

      const { bookings } = (await getSession(env.DB, session.id))!;
      expect(bookings.at(-1)).toMatchObject({ fullName: "Waiting", status: "confirmed" });
      expect(await removeBooking(env, ORIGIN, first.ok ? first.signupId : 0, waitUntil)).toMatchObject({ ok: false });
    } finally {
      vi.useRealTimers();
    }
  });

  it("check people in and out", async () => {
    const booking = await add("Door Person");
    const id = booking.ok ? booking.signupId : 0;

    expect(await setCheckedIn(env.DB, id, true)).toEqual({ ok: true });
    const checkedIn = (await getSession(env.DB, session.id))!.bookings[0].checkedInAt;
    expect(checkedIn).toMatch(/^2\d{3}-\d\d-\d\dT/);

    // Checking in twice keeps the first time.
    await setCheckedIn(env.DB, id, true);
    expect((await getSession(env.DB, session.id))!.bookings[0].checkedInAt).toBe(checkedIn);

    await setCheckedIn(env.DB, id, false);
    expect((await getSession(env.DB, session.id))!.bookings[0].checkedInAt).toBeNull();
    expect(await setCheckedIn(env.DB, 9999, true)).toMatchObject({ ok: false });
  });
});
