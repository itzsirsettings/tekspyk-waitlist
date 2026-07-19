import { cookies } from "next/headers";
import { isAdminAccessAllowed } from "@/lib/admin-auth";
import { getWaitlistStats, listWaitlistEntries } from "@/lib/waitlist-store";
import { AdminTable } from "@/components/admin-table";

interface AdminPageProps {
  searchParams?: Promise<{ error?: string | string[] | undefined }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await (searchParams ?? Promise.resolve(undefined));
  const sessionValue = (await cookies()).get("tekspyk_admin_session")?.value;
  let requestedToken: string | null = null;
  try {
    requestedToken = sessionValue ? decodeURIComponent(sessionValue) : null;
  } catch {
    requestedToken = null;
  }
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN;
  const isAllowed = isAdminAccessAllowed({
    requestedToken,
    adminAccessToken,
    isProduction: process.env.NODE_ENV === "production",
  });

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
              <label className="block text-sm font-medium text-[oklch(15%_0.01_260)]">
                Access token
              </label>
              <input
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

  let stats, entries, dbError: string | null = null;
  try {
    [stats, entries] = await Promise.all([getWaitlistStats(), listWaitlistEntries()]);
  } catch (err) {
    console.error("Admin dashboard DB error:", err);
    dbError = err instanceof Error ? err.message : "Unknown database error";
    stats = { total: 0, confirmed: 0, pending: 0, countries: [], recentSignups: [] };
    entries = [];
  }

  return (
    <main className="min-h-screen bg-white text-[oklch(15%_0.01_260)] px-6 py-12 relative overflow-hidden hero-wash">
      <div className="mx-auto max-w-7xl space-y-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[oklch(92%_0.005_260)] pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[oklch(55%_0.22_262)]">Admin</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-[oklch(15%_0.01_260)]">
              TekSpyk Waitlist Dashboard
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

        {dbError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-800">
            <p className="font-semibold">Database Error</p>
            <p className="text-sm mt-1 font-mono text-xs">{dbError}</p>
          </div>
        )}

        {/* Stats Grid */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-[1.5rem] border border-[oklch(92%_0.005_260)] bg-white p-6 shadow-sm hover:shadow transition">
            <p className="text-xs font-bold uppercase tracking-wider text-[oklch(45%_0.015_260)]">Total Signups</p>
            <p className="mt-2 text-4xl font-extrabold text-[oklch(15%_0.01_260)]">{stats.total}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[oklch(92%_0.005_260)] bg-white p-6 shadow-sm hover:shadow transition">
            <p className="text-xs font-bold uppercase tracking-wider text-[oklch(45%_0.015_260)]">Confirmed</p>
            <p className="mt-2 text-4xl font-extrabold text-emerald-600">{stats.confirmed}</p>
          </div>
          <div className="rounded-[1.5rem] border border-[oklch(92%_0.005_260)] bg-white p-6 shadow-sm hover:shadow transition">
            <p className="text-xs font-bold uppercase tracking-wider text-[oklch(45%_0.015_260)]">Pending</p>
            <p className="mt-2 text-4xl font-extrabold text-[oklch(55%_0.22_262)]">{stats.pending}</p>
          </div>
        </section>

        {/* Top Countries */}
        <section className="rounded-[1.5rem] border border-[oklch(92%_0.005_260)] bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[oklch(15%_0.01_260)] mb-4">Top Countries</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {stats.countries.map((country) => (
              <div
                key={country.name}
                className="rounded-2xl border border-[oklch(92%_0.005_260)] bg-[oklch(97%_0.003_260)]/40 p-4 hover:bg-[oklch(97%_0.003_260)]/80 transition"
              >
                <p className="text-xs text-[oklch(45%_0.015_260)] font-semibold truncate">{country.name}</p>
                <p className="mt-1 text-2xl font-extrabold text-[oklch(15%_0.01_260)]">{country.count}</p>
              </div>
            ))}
            {stats.countries.length === 0 && (
              <p className="col-span-full py-4 text-center text-sm text-[oklch(45%_0.015_260)]">
                No country distribution data available yet.
              </p>
            )}
          </div>
        </section>

        {/* Interactive Signups List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[oklch(15%_0.01_260)]">Waitlist Entries</h2>
            <span className="text-xs font-semibold text-[oklch(45%_0.015_260)]">
              Showing {entries.length} registered users
            </span>
          </div>
          <AdminTable entries={entries} />
        </section>
        
      </div>
    </main>
  );
}
