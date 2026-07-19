import { getDatabasePool } from "@/lib/database";

export async function GET() {
  const pool = getDatabasePool();
  try {
    const client = await pool.connect();
    try {
      const result = await client.query("SELECT NOW() as server_time, version() as pg_version");
      return Response.json({
        ok: true,
        serverTime: result.rows[0].server_time,
        pgVersion: result.rows[0].pg_version,
      });
    } finally {
      client.release();
    }
  } catch (err) {
    return Response.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}