import { beforeEach, describe, expect, it, vi } from "vitest";
import type { WaitlistEntry } from "./waitlist-store";
import { sendAdminNotification } from "./email";

const sendMailMock = vi.fn();

vi.mock("nodemailer", () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: sendMailMock })),
  },
}));

describe("sendAdminNotification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = "smtp.example.com";
    process.env.SMTP_PORT = "465";
    process.env.SMTP_USER = "hello@example.com";
    process.env.SMTP_PASSWORD = "secret";
    process.env.SMTP_FROM = "TekSpyk <hello@example.com>";
    process.env.ADMIN_NOTIFICATION_EMAIL = "owner@example.com";
  });

  it("sends a signup alert to the configured admin inbox", async () => {
    const entry: WaitlistEntry = {
      id: "entry-1",
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+123456789",
      country: "United Kingdom",
      occupation: "Engineer",
      experienceLevel: "Intermediate",
      learningGoals: "Build faster with AI",
      newsletter: true,
      termsAccepted: true,
      status: "pending",
      createdAt: "2025-01-01T00:00:00.000Z",
      updatedAt: "2025-01-01T00:00:00.000Z",
    };

    await sendAdminNotification(entry);

    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "TekSpyk <hello@example.com>",
        to: "owner@example.com",
        subject: "New TekSpyk waitlist signup",
      }),
    );
  });
});
