import { describe, expect, it } from "vitest";
import { isAdminAccessAllowed } from "./admin-auth";

describe("isAdminAccessAllowed", () => {
  it("allows local development access when no token is configured", () => {
    expect(
      isAdminAccessAllowed({
        requestedToken: null,
        adminAccessToken: undefined,
        isProduction: false,
      }),
    ).toBe(true);
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
