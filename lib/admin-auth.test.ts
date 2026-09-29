import { describe, expect, it } from "vitest";
import { createAdminSession, isAdminAccessAllowed, isSameOrigin, verifyAdminSession } from "./admin-auth";

describe("isAdminAccessAllowed", () => {
  it("fails closed in local development when no token is configured", () => {
    expect(
      isAdminAccessAllowed({
        requestedToken: null,
        adminAccessToken: undefined,
        isProduction: false,
      }),
    ).toBe(false);
  });

  it("blocks access in production when no token is configured", () => {
    expect(
      isAdminAccessAllowed({
        requestedToken: null,
        adminAccessToken: undefined,
        isProduction: true,
      }),
    ).toBe(false);
  });

  it("accepts a matching admin token", () => {
    expect(
      isAdminAccessAllowed({
        requestedToken: "super-secret",
        adminAccessToken: "super-secret",
        isProduction: true,
      }),
    ).toBe(true);
  });

  it("rejects a mismatched admin token", () => {
    expect(
      isAdminAccessAllowed({
        requestedToken: "wrong-token",
        adminAccessToken: "super-secret",
        isProduction: true,
      }),
    ).toBe(false);
  });
});

describe("admin sessions", () => {
  const secret = "a-long-secret-that-never-belongs-in-a-cookie";
  it("issues an expiring session without exposing the access credential", () => {
    const session = createAdminSession(secret, 1000);
    expect(session).not.toContain(secret);
    expect(verifyAdminSession(session, secret, 2000)).toBe(true);
    expect(verifyAdminSession(session, secret, 1000 + 12 * 60 * 60 * 1000)).toBe(false);
  });
  it("rejects tampering, raw credentials, and sessions after credential rotation", () => {
    const session = createAdminSession(secret);
    expect(verifyAdminSession(`9${session}`, secret)).toBe(false);
    expect(verifyAdminSession(secret, secret)).toBe(false);
    expect(verifyAdminSession(session, "rotated-secret")).toBe(false);
    expect(verifyAdminSession("broken", secret)).toBe(false);
  });
  it("rejects cross-origin and missing-origin writes", () => {
    expect(isSameOrigin(new Request("https://tekspyk.com/api/admin/session", { headers: { origin: "https://evil.example" } }))).toBe(false);
    expect(isSameOrigin(new Request("https://tekspyk.com/api/admin/session"))).toBe(false);
    expect(isSameOrigin(new Request("https://tekspyk.com/api/admin/session", { headers: { origin: "https://tekspyk.com" } }))).toBe(true);
  });
});
