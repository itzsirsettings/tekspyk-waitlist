import type { NextRequest } from "next/server";
import { createWaitlistEntry } from "@/lib/waitlist-store";
import { waitlistSchema } from "@/lib/waitlist-schema";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const rateCheck = checkRateLimit(rateLimitKey(request));
    if (!rateCheck.allowed) {
      return Response.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    const payload = await request.json();
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

    const entry = await createWaitlistEntry(parsed.data);
    return Response.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    return Response.json({ success: false, error: error instanceof Error ? error.message : "Unable to join the waitlist." }, { status: 409 });
  }
}

export async function GET() {
  return Response.json({ status: "ok" });
}
