import { isAdminAccessAllowed, isSameOrigin } from "@/lib/admin-auth";
import { startAdminSession } from "@/lib/admin-session";
import { apiError, readRequestText } from "@/lib/http";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

function redirectWithSession(request: Request, location: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const origin = new URL(request.url).origin;
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(location, origin).toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": `tekspyk_admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
    },
  });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });
  try {
    const limit = await checkRateLimit(rateLimitKey(request, "admin-login"), 5, 15 * 60_000);
    if (!limit.allowed) {
      return new Response("Too many sign-in attempts. Please try again later.", {
        status: 429,
        headers: { "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) },
      });
    }
  } catch {
    console.error("Admin sign-in rate limiter unavailable");
    return new Response("Sign-in is temporarily unavailable.", { status: 503 });
  }
  let body: string;
  try { body = await readRequestText(request, 4096); }
  catch (error) { return apiError(error, "admin_login_body"); }
  const token = new URLSearchParams(body).get("token");
  const isAllowed = isAdminAccessAllowed({
    requestedToken: token,
    adminAccessToken: process.env.ADMIN_ACCESS_TOKEN,
    isProduction: process.env.NODE_ENV === "production",
  });

  if (!isAllowed) {
    return redirectWithSession(request, "/admin?error=invalid-token", "", 0);
  }

  try { return redirectWithSession(request, "/admin", await startAdminSession(), 60 * 60 * 12); }
  catch (error) { return apiError(error, "admin_login_session"); }
}
