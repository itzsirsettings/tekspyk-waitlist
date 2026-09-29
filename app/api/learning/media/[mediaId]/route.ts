import { NextResponse } from "next/server";
import { currentLearningUser } from "@/lib/learning-session";
import { getDatabasePool } from "@/lib/database";
import { readStoredMedia, storedMediaSize } from "@/lib/learning-media-storage";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ mediaId: string }> }) {
  const user = await currentLearningUser();
  if (!user) return NextResponse.json({ error: "Sign in to view lesson media." }, { status: 401 });
  const { mediaId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(mediaId)) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  const found = await getDatabasePool().query<{ storage_key: string; mime_type: string; original_name: string; alt_text: string; class_id: string }>(
    `SELECT m.storage_key, m.mime_type, m.original_name, m.alt_text, m.class_id
     FROM learning_media m JOIN learning_classes c ON c.id = m.class_id
     JOIN learning_lessons l ON l.id = m.lesson_id
     WHERE m.id = $1 AND (
       (l.published AND c.status = 'published' AND (c.instructor_id = $2 OR $3 OR EXISTS (SELECT 1 FROM learning_enrollments e WHERE e.class_id = c.id AND e.user_id = $2)))
       OR ((c.status = 'draft' OR NOT l.published) AND (c.instructor_id = $2 OR $3))
     )`,
    [mediaId, user.id, user.role === "admin"],
  );
  const media = found.rows[0];
  if (!media) return NextResponse.json({ error: "Media not found." }, { status: 404 });
  const range = media.mime_type.startsWith("video/") ? request.headers.get("range") : null;
  const totalSize = range ? await storedMediaSize(media.storage_key) : null;
  if (range && totalSize == null) return NextResponse.json({ error: "Media is temporarily unavailable." }, { status: 503 });
  let start = 0;
  let end = (totalSize ?? 0) - 1;
  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match || (!match[1] && !match[2])) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${totalSize}` } });
    if (!match[1]) start = Math.max(0, totalSize! - Number(match[2]));
    else start = Number(match[1]);
    if (match[2] && match[1]) end = Number(match[2]);
    if (start > end || start >= totalSize!) return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${totalSize}` } });
  }
  const stored = await readStoredMedia(media.storage_key, start, range ? end : undefined);
  if (!stored) return NextResponse.json({ error: "Media is temporarily unavailable." }, { status: 503 });
  const filename = media.original_name.replace(/[\r\n"\\]/g, "_");
  const asciiFilename = filename.replace(/[^\x20-\x7e]/g, "_");
  return new Response(stored.body, {
    status: range ? 206 : 200,
    headers: {
      "Content-Type": media.mime_type,
      "Content-Length": String(stored.body.byteLength),
      "Content-Disposition": `inline; filename="${asciiFilename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "private, max-age=60",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      ...(range ? { "Accept-Ranges": "bytes", "Content-Range": `bytes ${stored.start}-${stored.end}/${stored.byteSize}` } : {}),
    },
  });
}
