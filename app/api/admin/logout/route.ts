export async function POST(request: Request) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return new Response(null, {
    status: 303,
    headers: {
      Location: new URL("/admin", request.url).toString(),
      "Set-Cookie": `tekspyk_admin_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`,
    },
  });
}
