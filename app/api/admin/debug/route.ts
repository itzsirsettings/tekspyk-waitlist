import { NextResponse } from "next/server";
import { isAdminAccessAllowed } from "@/lib/admin-auth";
import { getDatabasePool } from "@/lib/database";

export async function GET(request: Request) {
  const isAllowed = await isAdminAccessAllowed(request);
  if (!isAllowed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // Check env
  const dbUrl = process.env.DATABASE_URL ?? "";
  results.dbUrlPrefix = dbUrl.slice(0, 30) + "...";
  results.dbUrlHasSslmode = dbUrl.includes("sslmode");

  // Try pool query
  try {
    const pool = getDatabasePool();
    const res = await pool.query("SELECT NOW() as now, current_database() as db, current_user as user");
    results.dbNow = res.rows[0].now;
    results.dbName = res.rows[0].db;
    results.dbUser = res.rows[0].user;
    results.dbConnected = true;
  } catch (err: unknown) {
    results.dbConnected = false;
    results.dbError = err instanceof Error ? err.message : String(err);
  }

  // Try table query
  try {
    const pool = getDatabasePool();
    const res = await pool.query("SELECT count(*)::int as count FROM waitlist_entries");
    results.waitlistCount = res.rows[0].count;
    results.tableExists = true;
  } catch (err: unknown) {
    results.tableExists = false;
    results.tableError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results);
}
