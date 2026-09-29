import { describe, expect, it } from "vitest";
import { buildSignupConfirmationEmail } from "../src/lib/experienceSignupEmail";
import type { ExperienceSession } from "../src/data/conferenceTimeline";

const session = {
  id: "2026-10-09-sound-bath-1100",
  day: "Fri 9 Oct",
  date: "2026-10-09",
  time: "11:00–12:00",
  title: "Sound bath",
  personName: "Ada Example",
  venue: "Saal 4",
  signup: true,
  capacity: 30,
} satisfies ExperienceSession;

describe("experience signup confirmation email", () => {
  it("includes calendar and cancel links", () => {
    const email = buildSignupConfirmationEmail({
      fullName: "Ada Example",
      session,
      status: "confirmed",
      cancelUrl: "https://alpsconference.com/links/cancel?token=abc",
      icalUrl: "https://alpsconference.com/api/experience-signups/ical?token=abc",
    });

    expect(email.subject).toContain("You're in");
    expect(email.subject).toContain("Sound bath");
    expect(email.text).toContain("Add to your calendar:");
    expect(email.text).toContain("https://alpsconference.com/api/experience-signups/ical?token=abc");
    expect(email.text).toContain("https://alpsconference.com/links/cancel?token=abc");
    expect(email.html).toContain("Add to calendar");
    expect(email.html).toContain("Cancel this booking");
    expect(email.html).toContain("Saal 4");
  });

  it("mentions waitlist position when applicable", () => {
    const email = buildSignupConfirmationEmail({
      fullName: "Ada Example",
      session,
      status: "waitlist",
      waitlistPosition: 3,
      cancelUrl: "https://example.com/cancel",
      icalUrl: "https://example.com/ical",
    });

    expect(email.subject).toContain("Waitlist");
    expect(email.text).toContain("position 3");
    expect(email.html).toContain("You're on the waitlist");
  });

  it("says a spot opened up when promoted from the waitlist", () => {
    const email = buildSignupConfirmationEmail({
      fullName: "Ada Example",
      session,
      status: "confirmed",
      promoted: true,
      cancelUrl: "https://example.com/cancel",
      icalUrl: "https://example.com/ical",
    });

    expect(email.subject).toContain("A spot opened up");
    expect(email.text).toContain("you're off the waitlist");
    expect(email.html).toContain("Cancel this booking");
  });
});
