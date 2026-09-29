import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryMock, sendWelcomeEmailMock, sendAdminNotificationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  sendWelcomeEmailMock: vi.fn(),
  sendAdminNotificationMock: vi.fn(),
}));

vi.mock("./database", () => ({
  getDatabasePool: () => ({ query: queryMock }),
}));

vi.mock("./email", () => ({
  sendWelcomeEmail: sendWelcomeEmailMock,
  sendAdminNotification: sendAdminNotificationMock,
}));

import { createWaitlistEntry, exportWaitlistCsv } from "./waitlist-store";

const submission = {
  firstName: " Ada ",
  lastName: " Lovelace ",
  email: " ADA@EXAMPLE.COM ",
  phone: "+123456789",
  country: "United Kingdom",
  occupation: "Engineer",
  experienceLevel: "Intermediate",
  learningGoals: "Build faster with AI",
  referralCode: "",
  newsletter: true,
  adultConfirmed: true,
  termsAccepted: true,
};

describe("createWaitlistEntry", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMock.mockResolvedValue({ rowCount: 1 });
  });

  it("writes a normalized signup to PostgreSQL and notifies the visitor and owner", async () => {
    const entry = await createWaitlistEntry(submission);

    expect(entry.email).toBe("ada@example.com");
    expect(entry.firstName).toBe("Ada");
    expect(queryMock).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO waitlist_entries"), expect.arrayContaining(["ada@example.com"]));
    expect(sendWelcomeEmailMock).toHaveBeenCalledWith(entry);
    expect(sendAdminNotificationMock).toHaveBeenCalledWith(entry);
  });

  it("turns a database uniqueness error into the existing signup message", async () => {
    queryMock.mockRejectedValueOnce({ code: "23505" });

    await expect(createWaitlistEntry(submission)).rejects.toThrow("This email is already on the waitlist.");
  });

  it("retains a persisted signup when email delivery fails", async () => {
    sendWelcomeEmailMock.mockRejectedValueOnce(new Error("Provider unavailable"));
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const entry = await createWaitlistEntry(submission);
    expect(entry.email).toBe("ada@example.com");
    expect(log).toHaveBeenCalledWith(expect.stringContaining("waitlist_email_failed"));
    log.mockRestore();
  });

  it("neutralizes CSV formulas and escapes quotes in untrusted cells", async () => {
    queryMock.mockResolvedValueOnce({ rows: [{ id: "test", first_name: '=HYPERLINK("evil")', last_name: "Example", email: "test@example.test", phone: "+123", country: "GB", occupation: "Student", experience_level: "Beginner", learning_goals: "Learn", referral_code: null, newsletter: false, adult_confirmed: true, terms_accepted: true, status: "pending", created_at: new Date("2026-09-28"), updated_at: new Date("2026-09-28") }] });
    const csv = await exportWaitlistCsv();
    expect(csv).toContain(`"'=HYPERLINK(""evil"")"`);
    expect(csv).toContain(`"'+123"`);
  });
});
