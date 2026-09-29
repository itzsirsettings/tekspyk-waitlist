import { describe, expect, it } from "vitest";
import { waitlistSchema } from "./waitlist-schema";

describe("waitlistSchema", () => {
  it("accepts a valid waitlist submission", () => {
    const parsed = waitlistSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "+1 555 0123",
      country: "United States",
      occupation: "Founder",
      experienceLevel: "Intermediate",
      learningGoals: "Build AI products",
      referralCode: "TEKSPYK10",
      newsletter: true,
      adultConfirmed: true,
      termsAccepted: true,
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects invalid email and missing consent", () => {
    const parsed = waitlistSchema.safeParse({
      firstName: "",
      lastName: "",
      email: "not-an-email",
      phone: "",
      country: "",
      occupation: "",
      experienceLevel: "",
      learningGoals: "",
      referralCode: "",
      newsletter: false,
      adultConfirmed: false,
      termsAccepted: false,
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.some((issue) => issue.path.includes("email"))).toBe(true);
      expect(parsed.error.issues.some((issue) => issue.path.includes("termsAccepted"))).toBe(true);
      expect(parsed.error.issues.some((issue) => issue.path.includes("adultConfirmed"))).toBe(true);
    }
  });
});
