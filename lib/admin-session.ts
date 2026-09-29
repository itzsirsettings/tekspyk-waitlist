import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { createAdminSession, verifyAdminSession } from "@/lib/admin-auth";
import { getDatabasePool } from "@/lib/database";

function digest(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function startAdminSession() {
  const token = createAdminSession(process.env.ADMIN_ACCESS_TOKEN!);
  await getDatabasePool().query("INSERT INTO admin_sessions (token_hash, expires_at) VALUES ($1, now() + interval '12 hours')", [digest(token)]);
  return token;
}

export async function endAdminSession() {
  const token = (await cookies()).get("tekspyk_admin_session")?.value;
  if (token) await getDatabasePool().query("DELETE FROM admin_sessions WHERE token_hash = $1", [digest(token)]);
}

export async function hasAdminSession() {
  const session = (await cookies()).get("tekspyk_admin_session")?.value;
  if (!verifyAdminSession(session, process.env.ADMIN_ACCESS_TOKEN)) return false;
  const found = await getDatabasePool().query("SELECT 1 FROM admin_sessions WHERE token_hash = $1 AND expires_at > now()", [digest(session!)]);
  return !!found.rowCount;
}
