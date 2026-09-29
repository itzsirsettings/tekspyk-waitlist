import { hasAdminSession } from "@/lib/admin-session";
import { exportWaitlistCsv } from "@/lib/waitlist-store";

export async function GET() {
  const isAllowed = await hasAdminSession();

  if (!isAllowed) {
    return new Response("Unauthorized", { status: 401 });
  }

  let csv: string;
  try {
    csv = await exportWaitlistCsv();
  } catch {
    console.error("Waitlist export failed");
    return Response.json({ error: "Export is temporarily unavailable." }, { status: 503 });
  }
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=tekspyk-waitlist.csv",
      "Cache-Control": "private, no-store",
    },
  });
}
