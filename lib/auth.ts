import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { after } from "next/server";
import { getDatabasePool } from "@/lib/database";
import { appUrl } from "@/lib/env";
import { sendTransactionalEmail } from "@/lib/email";

function queueAuthEmail(to: string, subject: string, url: string) {
  after(async () => {
    try { await sendTransactionalEmail({ to, subject, text: `${subject}\n\n${url}\n\nIf you did not request this, you can ignore this email.\nThe TekSpyk team` }); }
    catch { console.error(JSON.stringify({ event: "auth_email_failed", operation: subject.includes("Reset") ? "password_reset" : "verification" })); }
  });
}

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters");
  return betterAuth({
    appName: "TekSpyk",
    baseURL: appUrl(),
    secret,
    database: getDatabasePool(),
    trustedOrigins: [new URL(appUrl()).origin],
    advanced: { ipAddress: { ipAddressHeaders: ["x-real-ip"] } },
    emailAndPassword: {
      enabled: true,
      disableSignUp: process.env.LEARNING_REGISTRATION_ENABLED !== "true",
      requireEmailVerification: true,
      autoSignIn: false,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: async ({ user, url }) => queueAuthEmail(user.email, "Reset your TekSpyk password", url),
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) => queueAuthEmail(user.email, "Verify your TekSpyk email", url),
    },
    user: {
      modelName: "learning_users",
      additionalFields: {
        role: { type: "string", defaultValue: "student", input: false },
        adultConfirmed: { type: "boolean", required: true, input: true },
        termsAccepted: { type: "boolean", required: true, input: true },
        termsVersion: { type: "string", defaultValue: "2026-09-28", input: false },
      },
    },
    session: { modelName: "learning_sessions", expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    account: { modelName: "learning_accounts" },
    verification: { modelName: "learning_verifications" },
    rateLimit: {
      enabled: true, storage: "database", modelName: "auth_rate_limits", window: 60, max: 60,
      customRules: {
        "/sign-up/email": { window: 600, max: 5 },
        "/sign-in/email": { window: 60, max: 5 },
        "/request-password-reset": { window: 600, max: 3 },
        "/send-verification-email": { window: 600, max: 3 },
      },
    },
    databaseHooks: {
      user: { create: { before: async (user) => {
        if (!user.name || user.name.trim().length < 2 || user.name.trim().length > 100) {
          throw new APIError("BAD_REQUEST", { message: "Use a display name between 2 and 100 characters." });
        }
        if (user.adultConfirmed !== true) {
          throw new APIError("FORBIDDEN", { message: "Accounts for learners under 18 are not open yet." });
        }
        if (user.termsAccepted !== true) throw new APIError("BAD_REQUEST", { message: "Accept the terms before creating an account." });
        return { data: { ...user, name: user.name.trim(), role: "student" } };
      } } },
    },
  });
}

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() { return instance ??= createAuth(); }
