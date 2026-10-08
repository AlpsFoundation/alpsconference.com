import { beforeEach, describe, expect, it, vi } from "vitest";

const { send, close, connect } = vi.hoisted(() => {
  const send = vi.fn(async () => {});
  const close = vi.fn(async () => {});
  return { send, close, connect: vi.fn(async () => ({ send, close })) };
});
vi.mock("worker-mailer", () => ({ LogLevel: { WARN: 2 }, WorkerMailer: { connect } }));

import { sendBookingEmail } from "../src/lib/bookingMailer";

const email = { to: "ada@example.com", subject: "You're in", text: "Hi", html: "<p>Hi</p>" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("booking mailer", () => {
  it("sends as notifications@alps.foundation over Gmail with the app password", async () => {
    await sendBookingEmail(
      {
        SMTP_USER: "notifications@alps.foundation",
        GOOGLE_APPS_PASSWORD: "abcd efgh ijkl mnop",
        BOOKING_FROM_NAME: "ALPS Conference",
      },
      email,
    );

    expect(connect).toHaveBeenCalledWith(
      expect.objectContaining({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        credentials: { username: "notifications@alps.foundation", password: "abcdefghijklmnop" },
      }),
    );
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: { email: "notifications@alps.foundation", name: "ALPS Conference" },
        to: "ada@example.com",
      }),
    );
    expect(close).toHaveBeenCalledOnce();
  });

  it("skips sending without the app password", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await sendBookingEmail({ SMTP_USER: "notifications@alps.foundation" }, email);
    expect(connect).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("GOOGLE_APPS_PASSWORD"));
    warn.mockRestore();
  });
});
