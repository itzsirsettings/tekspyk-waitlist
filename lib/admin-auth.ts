import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export interface AdminAccessContext {
  requestedToken: string | null;
  adminAccessToken: string | undefined;
  isProduction: boolean;
}

export function isAdminAccessAllowed({
  requestedToken,
  adminAccessToken,
}: AdminAccessContext) {
  if (!adminAccessToken || !requestedToken) {
    return false;
  }
  const supplied = Buffer.from(requestedToken);
  const expected = Buffer.from(adminAccessToken);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

const sessionLifetimeSeconds = 12 * 60 * 60;

export function createAdminSession(adminAccessToken: string, now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + sessionLifetimeSeconds;
  const payload = `${expiresAt}.${randomBytes(16).toString("base64url")}`;
  const signature = createHmac("sha256", adminAccessToken).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyAdminSession(
  session: string | undefined,
  adminAccessToken: string | undefined,
  now = Date.now(),
) {
  if (!session || !adminAccessToken) return false;
  const parts = session.split(".");
  if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[A-Za-z0-9_-]{22}$/.test(parts[1])) return false;
  const expiresAt = Number(parts[0]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  const expected = createHmac("sha256", adminAccessToken)
    .update(`${parts[0]}.${parts[1]}`)
    .digest();
  let supplied: Buffer;
  try {
    supplied = Buffer.from(parts[2], "base64url");
  } catch {
    return false;
  }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !!origin && origin === new URL(request.url).origin;
}
