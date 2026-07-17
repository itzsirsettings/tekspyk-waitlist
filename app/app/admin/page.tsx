import { isAdminAccessAllowed } from "@/lib/admin-auth";
import { getWaitlistStats, listWaitlistEntries, exportWaitlistCsv } from "@/lib/waitlist-store";

interface AdminPageProps {
  searchParams?: Promise<{ token?: string | string[] | undefined }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const requestedToken = typeof params?.token === "string" ? params.token : null;
  const adminAccessToken = process.env.ADMIN_ACCESS_TOKEN;
  const isAllowed = isAdminAccessAllowed({
    requestedToken,
    adminAccessToken,
    isProduction: process.env.NODE_ENV === "production",
  });

  if (!isAllowed) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
        <div className="mx-auto flex max-w-xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/10 p-8 backdrop-blur">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Admin access</p>
            <h1 className="mt-2 text-3xl text-white">Enter the access token</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Set ADMIN_ACCESS_TOKEN in your environment to protect the waitlist dashboard from public access.
            </p>
          </div>

          <form method="get" action="/admin" className="space-y-4">
            <label className="block space-y-2 text-sm text-slate-300">
              <span>Access token</span>
              <input
                name="token"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-white outline-none ring-0"
                placeholder="Enter token"
              />
            </label>
            <button type="submit" className="rounded-full bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
              Continue
            </button>
          </form>

          {requestedToken ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              The supplied token was invalid.
            </p>
          ) : null}
        </div>
      </main>
    );
  }

  const [stats, entries, csv] = await Promise.all([getWaitlistStats(), listWaitlistEntries(), exportWaitlistCsv()]);

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200">Admin</p>
            <h1 className="text-3xl text-white">TekSpyk waitlist dashboard</h1>
          </div>
          <a href={`/api/admin/export`} className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            Export CSV
          </a>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Total signups</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.total}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Confirmed</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.confirmed}</p>
          </div>
          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-slate-400">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-white">{stats.pending}</p>
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <h2 className="text-xl text-white">Top countries</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {stats.countries.map((country) => (
              <div key={country.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">{country.name}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{country.count}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.5rem] border border-white/10 bg-white/10 p-6 backdrop-blur">
          <h2 className="text-xl text-white">Recent signups</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-slate-900/80 text-left text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/60">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-white">{entry.firstName} {entry.lastName}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.email}</td>
                    <td className="px-4 py-3 text-slate-300">{entry.country}</td>
                    <td className="px-4 py-3 text-cyan-200">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className="mt-6 hidden rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-xs text-slate-300">{csv}</pre>
        </section>
      </div>
    </main>
  );
}
