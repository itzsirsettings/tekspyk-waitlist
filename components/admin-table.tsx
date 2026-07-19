"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Mail, Phone, Search, Briefcase, GraduationCap, Calendar, Hash, Check, X } from "lucide-react";
import type { WaitlistEntry } from "@/lib/waitlist-store";

interface AdminTableProps {
  entries: WaitlistEntry[];
}

export function AdminTable({ entries }: AdminTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredEntries = entries.filter((entry) => {
    const fullName = `${entry.firstName} ${entry.lastName}`.toLowerCase();
    const email = entry.email.toLowerCase();
    const country = entry.country.toLowerCase();
    const occupation = entry.occupation.toLowerCase();
    const query = searchQuery.toLowerCase();

    return (
      fullName.includes(query) ||
      email.includes(query) ||
      country.includes(query) ||
      occupation.includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative max-w-md">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-[oklch(45%_0.015_260)]" />
        </div>
        <input
          type="text"
          placeholder="Search by name, email, country, or occupation..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-2xl border border-[oklch(92%_0.005_260)] bg-[oklch(97%_0.003_260)] py-3 pl-11 pr-4 text-sm text-[oklch(15%_0.01_260)] placeholder-[oklch(45%_0.015_260)] outline-none transition duration-200 focus:border-[oklch(55%_0.22_262)] focus:ring-1 focus:ring-[oklch(55%_0.22_262)] focus:bg-white"
        />
      </div>

      {/* Table Shell */}
      <div className="overflow-hidden rounded-2xl border border-[oklch(92%_0.005_260)] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[oklch(92%_0.005_260)] text-sm text-left">
            <thead>
              <tr className="bg-[oklch(97%_0.003_260)] text-[oklch(15%_0.01_260)] font-semibold">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Country</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[oklch(92%_0.005_260)]">
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[oklch(45%_0.015_260)]">
                    No signups found matching your search.
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  return (
                    <React.Fragment key={entry.id}>
                      {/* Primary Row */}
                      <tr
                        onClick={() => toggleRow(entry.id)}
                        className={`cursor-pointer transition duration-150 ${
                          isExpanded ? "bg-[oklch(97%_0.003_260)]/50" : "hover:bg-[oklch(97%_0.003_260)]/30"
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-[oklch(15%_0.01_260)]">
                          {entry.firstName} {entry.lastName}
                        </td>
                        <td className="px-6 py-4 text-[oklch(45%_0.015_260)]">
                          <a
                            href={`mailto:${entry.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 hover:text-[oklch(55%_0.22_262)] hover:underline"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            {entry.email}
                          </a>
                        </td>
                        <td className="px-6 py-4 text-[oklch(45%_0.015_260)]">{entry.country}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              entry.status === "confirmed"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : entry.status === "waitlisted"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleRow(entry.id);
                            }}
                            className="inline-flex items-center gap-1 text-[oklch(55%_0.22_262)] hover:text-[oklch(48%_0.21_262)] font-semibold transition"
                          >
                            {isExpanded ? (
                              <>
                                <span>Hide Details</span>
                                <ChevronUp className="h-4 w-4" />
                              </>
                            ) : (
                              <>
                                <span>View Details</span>
                                <ChevronDown className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Details Row */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={5} className="bg-[oklch(97%_0.003_260)]/20 px-6 py-6 border-t border-[oklch(92%_0.005_260)]">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {/* Left Column: Personal info & Reach out */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[oklch(15%_0.01_260)]">
                                  Contact & Profile
                                </h4>
                                <ul className="space-y-3">
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    <Phone className="h-4 w-4 text-[oklch(55%_0.22_262)] shrink-0" />
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Phone:</span>
                                    <a
                                      href={`tel:${entry.phone}`}
                                      className="text-[oklch(55%_0.22_262)] hover:underline"
                                    >
                                      {entry.phone}
                                    </a>
                                  </li>
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    <Briefcase className="h-4 w-4 text-[oklch(55%_0.22_262)] shrink-0" />
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Occupation:</span>
                                    <span>{entry.occupation}</span>
                                  </li>
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    <GraduationCap className="h-4 w-4 text-[oklch(55%_0.22_262)] shrink-0" />
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Experience:</span>
                                    <span>{entry.experienceLevel}</span>
                                  </li>
                                </ul>
                              </div>

                              {/* Center Column: System Details & Marketing */}
                              <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[oklch(15%_0.01_260)]">
                                  Registration Info
                                </h4>
                                <ul className="space-y-3">
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    <Calendar className="h-4 w-4 text-[oklch(55%_0.22_262)] shrink-0" />
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Signed Up:</span>
                                    <span>{formatDate(entry.createdAt)}</span>
                                  </li>
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    <Hash className="h-4 w-4 text-[oklch(55%_0.22_262)] shrink-0" />
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Referral Code:</span>
                                    <span className="italic">{entry.referralCode || "None"}</span>
                                  </li>
                                  <li className="flex items-center gap-2.5 text-[oklch(45%_0.015_260)]">
                                    {entry.newsletter ? (
                                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                    ) : (
                                      <X className="h-4 w-4 text-[oklch(45%_0.015_260)] shrink-0" />
                                    )}
                                    <span className="text-[oklch(15%_0.01_260)] font-medium">Newsletter:</span>
                                    <span>{entry.newsletter ? "Yes" : "No"}</span>
                                  </li>
                                </ul>
                              </div>

                              {/* Right Column: Learning Goals (Full-width equivalent on small screens) */}
                              <div className="space-y-3 md:col-span-2 lg:col-span-1">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-[oklch(15%_0.01_260)]">
                                  Learning Goals & Motivations
                                </h4>
                                <div className="rounded-xl border border-[oklch(92%_0.005_260)] bg-white p-3.5 text-xs text-[oklch(15%_0.01_260)] leading-relaxed shadow-inner">
                                  {entry.learningGoals || "No learning goals specified."}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
