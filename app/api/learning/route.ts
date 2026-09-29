import { isSameOrigin } from "@/lib/admin-auth";
import { apiError, HttpError, readJson } from "@/lib/http";
import { requireLearningUser } from "@/lib/learning-session";
import { learningActionSchema } from "@/lib/learning-schema";
import { applyLearningAction } from "@/lib/learning-store";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) throw new HttpError(403, "Forbidden.");
    const user = await requireLearningUser();
    const rate = await checkRateLimit(`learning:${user.id}`, 60, 60_000);
    if (!rate.allowed) throw new HttpError(429, "Too many changes. Please wait a minute.");
    const parsed = learningActionSchema.safeParse(await readJson(request, 131_072));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Check your input.");
    const result = await applyLearningAction(user, parsed.data);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "learning_write"); }
}
