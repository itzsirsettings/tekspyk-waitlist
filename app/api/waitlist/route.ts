import type { NextRequest } from "next/server";
import { createWaitlistEntry } from "@/lib/waitlist-store";
import { waitlistSchema } from "@/lib/waitlist-schema";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { HttpError, readJson } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const rateCheck = await checkRateLimit(rateLimitKey(request));
    if (!rateCheck.allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, Math.ceil((rateCheck.resetAt - Date.now()) / 1000))),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    const payload = await readJson(request, 16_384);
    const parsed = waitlistSchema.safeParse(payload);

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: "Please correct the highlighted fields.",
          errors: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path[0], issue.message])),
        },
        { status: 400 },
      );
    }

    await createWaitlistEntry(parsed.data);
    return Response.json({ success: true }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof HttpError) return Response.json({ success: false, error: error.message }, { status: error.status });
    if (error instanceof Error && error.message === "This email is already on the waitlist.") {
      return Response.json({ success: false, error: error.message }, { status: 409 });
    }
    console.error("Waitlist submission failed", { code: typeof error === "object" && error && "code" in error ? error.code : "unknown" });
    return Response.json(
      { success: false, error: "Unable to complete your signup right now." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function GET() {
  return Response.json({ status: "ok" });
}
