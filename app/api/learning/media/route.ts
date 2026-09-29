import { randomUUID } from "node:crypto";
import path from "node:path";
import { NextResponse } from "next/server";
import { currentLearningUser, requireTeacher } from "@/lib/learning-session";
import { isSameOrigin } from "@/lib/admin-auth";
import { getDatabasePool, withTransaction } from "@/lib/database";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { storeUploadedMedia, isSupportedMediaType } from "@/lib/learning-media-storage";
import { HttpError } from "@/lib/http";

export const runtime = "nodejs";
const MAX_REQUEST_BYTES = 66 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const user = await currentLearningUser();
  if (!user) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  try { requireTeacher(user); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Teacher access is required." }, { status: 403 }); }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_REQUEST_BYTES) return NextResponse.json({ error: "The upload is too large. Images are limited to 12 MiB and videos to 64 MiB." }, { status: 413 });
  try {
    const limit = await checkRateLimit(rateLimitKey(request, "learning-media"), 40, 60 * 60 * 1000);
    if (!limit.allowed) return NextResponse.json({ error: "Upload limit reached. Try again later." }, { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) } });
    const form = await request.formData();
    const classId = String(form.get("classId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(classId)) return NextResponse.json({ error: "Choose a class for this upload." }, { status: 400 });
    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return NextResponse.json({ error: "Choose an image or video to upload." }, { status: 400 });
    if (!isSupportedMediaType(file.type)) return NextResponse.json({ error: "Choose a JPEG, PNG, or WebP image, or an MP4 or WebM video." }, { status: 415 });
    const altText = String(form.get("altText") ?? "").trim().slice(0, 300);
    if (altText.length < 5) return NextResponse.json({ error: "Add a short description explaining the image or video." }, { status: 400 });

    const pool = getDatabasePool();
    const lessonId = String(form.get("lessonId") ?? "");
    if (lessonId && !/^[0-9a-f-]{36}$/i.test(lessonId)) return NextResponse.json({ error: "Lesson not found." }, { status: 400 });
    const owner = await pool.query<{ id: string }>(
      `SELECT c.id FROM learning_classes c
       WHERE c.id = $1 AND (c.instructor_id = $2 OR $3)
         AND (nullif($4::text, '') IS NULL OR EXISTS (SELECT 1 FROM learning_lessons l WHERE l.id = $4::uuid AND l.class_id = c.id AND (c.status = 'draft' OR NOT l.published)))`,
      [classId, user.id, user.role === "admin", lessonId],
    );
    if (!owner.rowCount) return NextResponse.json({ error: "Media can only be added to a class draft you manage." }, { status: 404 });

    const { storageKey, byteSize } = await storeUploadedMedia(file, file.type);
    const mediaId = randomUUID();
    const originalName = path.basename(file.name).replace(/[\u0000-\u001f\u007f]/g, "_").slice(0, 240) || "lesson-media";
    try {
      await withTransaction(async (client) => {
        await client.query("INSERT INTO learning_media (id, class_id, lesson_id, storage_key, original_name, mime_type, byte_size, alt_text) VALUES ($1, $2, nullif($3, '')::uuid, $4, $5, $6, $7, $8)", [mediaId, classId, lessonId, storageKey, originalName, file.type, byteSize, altText]);
        await client.query("INSERT INTO learning_audit (id, actor_id, action, resource_id, details) VALUES ($1, $2, 'lesson_media_uploaded', $3, $4)", [randomUUID(), user.id, mediaId, JSON.stringify({ classId, mimeType: file.type, byteSize })]);
      });
    } catch (error) {
      const { removeStoredMedia } = await import("@/lib/learning-media-storage");
      await removeStoredMedia(storageKey).catch((cleanupError) => console.error(JSON.stringify({ event: "learning_media_cleanup_failed", mediaId, reason: cleanupError instanceof Error ? cleanupError.message : "unknown" })));
      throw error;
    }
    return NextResponse.json({ id: mediaId, mimeType: file.type, originalName, altText, byteSize }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof HttpError) return NextResponse.json({ error: error.message }, { status: error.status });
    const message = error instanceof Error && (error.message.startsWith("Media storage") || error.message.startsWith("Choose") || error.message.startsWith("Images") || error.message.startsWith("Videos") || error.message.startsWith("The file")) ? error.message : "Unable to upload this file. Check its format and try again.";
    console.error(JSON.stringify({ event: "learning_media_upload_failed", userId: user.id, reason: error instanceof Error ? error.message : "unknown" }));
    return NextResponse.json({ error: message }, { status: message.startsWith("Media storage") ? 503 : 400 });
  }
}
