import { isAdminAccessAllowed } from "@/lib/admin-auth";
import { exportWaitlistCsv } from "@/lib/waitlist-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedToken = searchParams.get("token");
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN;
  const isAllowed = isAdminAccessAllowed({
    requestedToken,
    adminAccessToken,
    isProduction: process.env.NODE_ENV === "production",
  });

  if (!isAllowed) {
    return new Response("Unauthorized", { status: 401 });
  }

  const csv = await exportWaitlistCsv();
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=tekspyk-waitlist.csv",
    },
  });
}
