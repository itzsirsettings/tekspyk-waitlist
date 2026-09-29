import { createHash } from "node:crypto";
import { getDatabasePool } from "@/lib/database";

export async function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const result = await getDatabasePool().query<{ count: number; reset_at: Date }>(
    `INSERT INTO request_rate_limits (key, count, reset_at)
     VALUES ($1, 1, now() + ($2::integer * interval '1 millisecond'))
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN request_rate_limits.reset_at <= now() THEN 1 ELSE request_rate_limits.count + 1 END,
       reset_at = CASE WHEN request_rate_limits.reset_at <= now()
         THEN now() + ($2::integer * interval '1 millisecond') ELSE request_rate_limits.reset_at END
     RETURNING count, reset_at`,
    [key, windowMs],
  );
  const count = result.rows[0].count;
  return {
    allowed: count <= maxRequests,
    remaining: Math.max(0, maxRequests - count),
    resetAt: result.rows[0].reset_at.getTime(),
  };
}

export function rateLimitKey(request: Request, purpose = "waitlist"): string {
  // Railway ingress supplies X-Real-IP. Do not trust an arbitrary forwarded chain.
  const ip = request.headers.get("x-real-ip") || "unknown";
  return `${purpose}:${createHash("sha256").update(ip).digest("hex")}`;
}
