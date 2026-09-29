import { z } from "zod";

const productionSchema = z.object({
  DATABASE_URL: z.string().url(),
  ADMIN_ACCESS_TOKEN: z.string().min(32),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().startsWith("https://"),
  LEARNING_REGISTRATION_ENABLED: z.enum(["true", "false"]).default("false"),
  AUTH_EMAIL_VERIFICATION_ENABLED: z.enum(["true", "false"]).default("false"),
});

export function validateRuntimeEnvironment() {
  if (process.env.NODE_ENV !== "production") return;
  const parsed = productionSchema.safeParse(process.env);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path[0]))].join(", ");
    throw new Error(`Invalid server configuration: ${fields}`);
  }
  if (parsed.data.LEARNING_REGISTRATION_ENABLED === "true" && parsed.data.AUTH_EMAIL_VERIFICATION_ENABLED === "true") {
    for (const key of ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"]) {
      if (!process.env[key]) throw new Error(`Required email configuration is missing: ${key}`);
    }
  }
}

export function appUrl() {
  const value = process.env.BETTER_AUTH_URL;
  if (!value && process.env.NODE_ENV === "production") throw new Error("BETTER_AUTH_URL is required");
  return value ?? "http://localhost:3000";
}
