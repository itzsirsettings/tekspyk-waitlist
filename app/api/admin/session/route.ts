import { isAdminAccessAllowed } from "@/lib/admin-auth";

function redirectWithSession(request: Request, location: string, value: string, maxAge: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL(location, request.url).toString(),
      "Set-Cookie": `tekspyk_admin_session=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`,
    },
  });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const requestedToken = formData.get("token");
  const token = typeof requestedToken === "string" ? requestedToken : null;
  const isAllowed = isAdminAccessAllowed({
    requestedToken: token,
    adminAccessToken: process.env.ADMIN_ACCESS_TOKEN,
    isProduction: process.env.NODE_ENV === "production",
  });

  if (!isAllowed) {
    return redirectWithSession(request, "/admin?error=invalid-token", "", 0);
  }

  return redirectWithSession(request, "/admin", token ?? "local-development", 60 * 60 * 24 * 7);
}
