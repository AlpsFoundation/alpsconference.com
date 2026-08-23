import { afterEach, describe, expect, it, vi } from "vitest";
import { getConferenceCountdown } from "../src/components/ConferenceCountdown";

describe("conference countdown", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows weeks and remaining days before the event", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-23T12:00:00+02:00"));

    expect(getConferenceCountdown()?.label).toBe("6 weeks · 5 days");
  });

  it("uses Tomorrow on the day before the conference", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-08T12:00:00+02:00"));

    expect(getConferenceCountdown()).toMatchObject({
      prefix: "Conference begins",
      label: "Tomorrow",
    });
  });

  it("does not render during or after the conference", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T00:01:00+02:00"));
    expect(getConferenceCountdown()).toBeNull();

    vi.setSystemTime(new Date("2026-10-11T12:00:00+02:00"));
    expect(getConferenceCountdown()).toBeNull();
  });
});
