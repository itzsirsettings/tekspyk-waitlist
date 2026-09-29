"use client";

import { useState } from "react";
import type { WaitlistEntry, WaitlistStats } from "@/lib/waitlist-store";
import type { CurriculumTopicState } from "@/lib/curriculum-store";
import { AdminTable } from "@/components/admin-table";
import { CurriculumAdmin } from "@/components/curriculum-admin";

interface AdminTabsProps {
  stats: WaitlistStats;
  entries: WaitlistEntry[];
  curriculumStates: Record<string, CurriculumTopicState>;
  dbError: string | null;
}

export function AdminTabs({ stats, entries, curriculumStates, dbError }: AdminTabsProps) {
  const [tab, setTab] = useState<"waitlist" | "curriculum">("waitlist");

  return (
    <div className="space-y-10">
      {/* Tab bar */}
      <div className="flex gap-2 border-b border-[oklch(92%_0.005_260)] pb-4">
        {([
          ["waitlist", "Waitlist"],
          ["curriculum", "Curriculum"],
        ] as ["waitlist" | "curriculum", string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === key
                ? "bg-[oklch(55%_0.22_262)] text-white"
                : "border border-[oklch(92%_0.005_260)] bg-white text-[oklch(45%_0.015_260)] hover:text-[oklch(15%_0.01_260)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "waitlist" ? (
        <>
          {dbError && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-4 text-amber-800">
              <p className="font-semibold">Database Error</p>
              <p className="mt-1 text-sm font-mono text-xs">{dbError}</p>
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

          {/* Waitlist Entries */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[oklch(15%_0.01_260)]">Waitlist Entries</h2>
              <span className="text-xs font-semibold text-[oklch(45%_0.015_260)]">
                Showing {entries.length} registered users
              </span>
            </div>
            <AdminTable entries={entries} />
          </section>
        </>
      ) : (
        <CurriculumAdmin initialStates={curriculumStates} />
      )}
    </div>
  );
}
