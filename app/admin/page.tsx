import type { Metadata } from "next";
import { hasAdminSession } from "@/lib/admin-session";
import { getWaitlistStats, listWaitlistEntries, type WaitlistEntry, type WaitlistStats } from "@/lib/waitlist-store";
import { getCurriculumTopicStates, type CurriculumTopicState } from "@/lib/curriculum-store";
import { AdminTabs } from "@/components/admin-tabs";
import { TeacherAccessForm } from "@/components/teacher-access-form";

interface AdminPageProps {
  searchParams?: Promise<{ error?: string | string[] | undefined }>;
}

export const metadata: Metadata = { title: "Administration", robots: { index: false, follow: false } };

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await (searchParams ?? Promise.resolve(undefined));
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN;
  const isAllowed = await hasAdminSession();

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-white text-[oklch(15%_0.01_260)] px-6 py-20 relative overflow-hidden hero-wash">
        <div className="mx-auto flex max-w-md flex-col gap-8 rounded-[2rem] border border-[oklch(92%_0.005_260)] bg-white p-8 shadow-xl relative z-10">
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(55%_0.22_262)]">Admin Access</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[oklch(15%_0.01_260)]">Enter Access Token</h1>
            <p className="mt-3 text-sm leading-relaxed text-[oklch(45%_0.015_260)]">
              {adminAccessToken
                ? "Enter your access token to view the dashboard."
                : <>Set <code className="bg-[oklch(97%_0.003_260)] px-1.5 py-0.5 rounded border border-[oklch(92%_0.005_260)] text-xs">ADMIN_ACCESS_TOKEN</code> in your environment to protect the waitlist dashboard.</>}
            </p>
          </div>

          <form method="post" action="/api/admin/session" className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="admin-token" className="block text-sm font-medium text-[oklch(15%_0.01_260)]">
                Access token
              </label>
              <input
                id="admin-token"
                name="token"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-2xl border border-[oklch(92%_0.005_260)] bg-[oklch(97%_0.003_260)] px-4 py-3 text-sm text-[oklch(15%_0.01_260)] outline-none transition duration-200 focus:border-[oklch(55%_0.22_262)] focus:ring-1 focus:ring-[oklch(55%_0.22_262)] focus:bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-[oklch(55%_0.22_262)] hover:bg-[oklch(48%_0.21_262)] py-3 px-4 font-semibold text-white transition duration-200 cursor-pointer shadow-sm hover:shadow-md"
            >
              Continue
            </button>
          </form>

          {params?.error === "invalid-token" ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              The supplied token was invalid.
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  let stats: WaitlistStats = { total: 0, confirmed: 0, pending: 0, countries: [], recentSignups: [] };
  let entries: WaitlistEntry[] = [];
  let dbError: string | null = null;
  let curriculumStates = new Map<string, CurriculumTopicState>();

  try {
    [stats, entries] = await Promise.all([getWaitlistStats(), listWaitlistEntries()]);
  } catch {
    console.error("Admin dashboard database read failed");
    dbError = "Signups could not be loaded. Please try again shortly.";
  }

  // Curriculum states — failure is non-fatal
  try {
    curriculumStates = await getCurriculumTopicStates();
  } catch {
    console.error("Admin curriculum read failed");
    dbError = "Curriculum changes could not be loaded. Please try again shortly.";
  }

  const curriculumStatesObj: Record<string, CurriculumTopicState> = Object.fromEntries(curriculumStates);

  return (
    <main className="min-h-screen bg-white text-[oklch(15%_0.01_260)] px-6 py-12 relative overflow-hidden hero-wash">
      <div className="mx-auto max-w-7xl space-y-10 relative z-10">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[oklch(92%_0.005_260)] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(55%_0.22_262)]">Admin</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[oklch(15%_0.01_260)]">
              TekSpyk Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/export"
              className="rounded-full border border-[oklch(92%_0.005_260)] bg-white hover:bg-[oklch(97%_0.003_260)] px-5 py-2.5 text-sm font-semibold text-[oklch(15%_0.01_260)] transition shadow-sm"
            >
              Export CSV
            </a>
            <form method="post" action="/api/admin/logout">
              <button
                type="submit"
                className="rounded-full border border-[oklch(92%_0.005_260)] bg-white hover:bg-[oklch(97%_0.003_260)] px-5 py-2.5 text-sm font-semibold text-red-600 transition shadow-sm cursor-pointer"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        <TeacherAccessForm />
        {dbError ? <p role="alert" className="form-error">{dbError}</p> : <AdminTabs
          stats={stats}
          entries={entries}
          curriculumStates={curriculumStatesObj}
          dbError={dbError}
        />}

      </div>
    </main>
  );
}
