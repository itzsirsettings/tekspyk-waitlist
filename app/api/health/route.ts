import { getDatabasePool } from "@/lib/database";

export async function GET() {
  try {
    const schema = await getDatabasePool().query("SELECT 1 FROM schema_migrations WHERE filename = '007_curriculum_media.sql'");
    if (!schema.rowCount) throw new Error("Schema not ready");
    return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
