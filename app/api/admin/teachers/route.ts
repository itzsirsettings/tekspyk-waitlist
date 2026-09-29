import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { hasAdminSession } from "@/lib/admin-session";
import { isSameOrigin } from "@/lib/admin-auth";
import { withTransaction } from "@/lib/database";
import { HttpError, apiError, readJson } from "@/lib/http";

const schema = z.object({ email: z.string().trim().email().max(254).transform(v => v.toLowerCase()), role: z.enum(["student", "teacher"]) });
export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) throw new HttpError(403, "Request origin is not allowed.");
    if (!(await hasAdminSession())) throw new HttpError(401, "Sign in as an administrator.");
    const parsed = schema.safeParse(await readJson(request, 4096));
    if (!parsed.success) throw new HttpError(400, "Enter an email address and select a role.");
    const session = (await cookies()).get("tekspyk_admin_session")!.value;
    const actor = `operator:${createHash("sha256").update(session).digest("hex")}`;
    await withTransaction(async client => {
      const result = await client.query<{id:string; role:string}>(`SELECT id, role FROM learning_users WHERE email = $1 AND "emailVerified" = true FOR UPDATE`, [parsed.data.email]);
      const user = result.rows[0];
      if (!user) throw new HttpError(404, "No verified account has this email address.");
      if (user.role === "admin") throw new HttpError(403, "Administrator roles cannot be changed here.");
      await client.query(`UPDATE learning_users SET role = $1, "updatedAt" = now() WHERE id = $2`, [parsed.data.role, user.id]);
      await client.query(`DELETE FROM learning_sessions WHERE "userId" = $1`, [user.id]);
      await client.query("INSERT INTO learning_audit (id, actor_id, action, resource_id, details) VALUES (gen_random_uuid(), $1, 'role_changed', $2, $3)", [actor, user.id, JSON.stringify({ from: user.role, to: parsed.data.role })]);
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error, "teacher_role"); }
}
