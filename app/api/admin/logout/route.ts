import { isSameOrigin } from "@/lib/admin-auth";
import { endAdminSession } from "@/lib/admin-session";
import { apiError } from "@/lib/http";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return new Response("Forbidden", { status: 403 });
  try { await endAdminSession(); }
  catch (error) { return apiError(error, "admin_logout"); }
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/admin", request.url).toString(),
      "Cache-Control": "no-store",
      "Set-Cookie": `tekspyk_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
    },
  });
}
