const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  record.count += 1;
  const remaining = Math.max(0, maxRequests - record.count);
  return { allowed: record.count <= maxRequests, remaining, resetAt: record.resetAt };
}

export function rateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  return `${ip}:${userAgent.slice(0, 32)}`;
}
