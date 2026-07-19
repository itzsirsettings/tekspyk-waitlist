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

import { createWaitlistEntry } from "./waitlist-store";

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
});
