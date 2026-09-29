import { getAuth } from "@/lib/auth";
import { apiError, HttpError, readRequestText } from "@/lib/http";

function privateResponse(response: Response) {
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export async function GET(request: Request) {
  try { return privateResponse(await getAuth().handler(request)); }
  catch (error) { return apiError(error, "auth_get"); }
}

export async function POST(request: Request) {
  try {
    const body = await readRequestText(request, 16_384);
    if (new URL(request.url).pathname.endsWith("/sign-up/email")) {
      let input: unknown;
      try { input = JSON.parse(body); } catch { throw new HttpError(400, "Invalid signup request."); }
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "Invalid signup request.");
      const signup = input as Record<string, unknown>;
      if (signup.adultConfirmed !== true) throw new HttpError(403, "Accounts for learners under 18 are not open yet.");
      if (signup.termsAccepted !== true) throw new HttpError(400, "Accept the terms before creating an account.");
    }
    return privateResponse(await getAuth().handler(new Request(request.url, { method: "POST", headers: request.headers, body })));
  } catch (error) { return apiError(error, "auth_post"); }
}
