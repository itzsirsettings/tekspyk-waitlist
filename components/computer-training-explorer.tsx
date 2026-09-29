"use client";

import { ChevronDown, Hammer } from "lucide-react";
import { useState } from "react";
import {
  CT_THREE_MONTH,
  CT_SIX_MONTH,
  CT_ASSESSMENT,
  CT_GRADING,
  CT_OUTCOMES_3M,
  CT_OUTCOMES_6M,
  type CtMonth,
  type CtWeek,
} from "@/lib/computer-training-data";
import { useTopicProgress } from "@/lib/use-topic-progress";
import type { CurriculumTopicState } from "@/lib/curriculum-store";

type Track = "3m" | "6m";

interface ComputerTrainingExplorerProps {
  topicStates?: Record<string, CurriculumTopicState>;
}

function topicId(weekId: string, topic: string) {
  return `ct_${weekId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function WeekPanel({
  week,
  topicStates,
  completed,
  hydrated,
  onToggle,
}: {
  week: CtWeek;
  trackKey: string;
  topicStates: Record<string, CurriculumTopicState>;
  completed: Set<string>;
  hydrated: boolean;
  onToggle: (id: string) => void;
}) {
  const visibleTopics = week.topics
    .map((t) => {
      const id = topicId(week.id, t);
      const state = topicStates[id];
      return { topic: t, id, status: state?.status ?? "active" };
    })
    .filter((t) => t.status !== "hidden");

  return (
    <div className="rounded-xl border border-line bg-white p-5">
      {/* Topics */}
      {visibleTopics.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-faint">Topics</p>
          <ul className="flex flex-col gap-1.5">
            {visibleTopics.map(({ topic, id, status }) => {
              if (status === "coming-soon") {
                return (
                  <li key={id} className="flex items-center gap-3 text-sm text-ink-faint">
                    <span className="h-4 w-4 shrink-0 rounded border border-line bg-surface" aria-hidden="true" />
                    <span>{topic}</span>
                    <span className="ml-auto rounded-full bg-surface-deep px-2 py-0.5 text-xs font-semibold">Coming soon</span>
                  </li>
                );
              }
              const checked = hydrated && completed.has(id);
              return (
                <li key={id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 text-sm transition-colors hover:bg-surface">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(id)}
                      className="h-4 w-4 shrink-0 accent-[oklch(55%_0.22_262)]"
                    />
                    <span className={checked ? "line-through text-ink-faint" : "text-ink"}>{topic}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Practicals */}
      {week.practicals.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink-faint">Practical</p>
          <ul className="flex flex-col gap-1 text-sm text-ink-soft">
            {week.practicals.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Project */}
      {week.project && (
        <div className="flex gap-3 rounded-xl bg-blue/5 p-4">
          <Hammer className="mt-0.5 h-4 w-4 shrink-0 text-blue" aria-hidden="true" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue">Project</p>
            <p className="mt-1 text-sm text-ink-soft">{week.project}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MonthAccordion({
  month,
  trackKey,
  topicStates,
  completed,
  hydrated,
  onToggle,
}: {
  month: CtMonth;
  trackKey: string;
  topicStates: Record<string, CurriculumTopicState>;
  completed: Set<string>;
  hydrated: boolean;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [openWeeks, setOpenWeeks] = useState<Set<string>>(new Set());

  const toggleWeek = (weekId: string) => {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekId)) next.delete(weekId);
      else next.add(weekId);
      return next;
    });
  };

  // Count active, non-hidden topics in this month for the pill
  const allTopicIds = month.weeks.flatMap((w) =>
    w.topics
      .map((t) => {
        const id = topicId(w.id, t);
        const state = topicStates[id];
        return state?.status === "hidden" ? null : id;
      })
      .filter((id): id is string => id !== null)
  );
  const completedCount = allTopicIds.filter((id) => completed.has(id)).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
      >
        <span className="font-semibold text-ink">{month.title}</span>
        <div className="flex shrink-0 items-center gap-3">
          {hydrated && allTopicIds.length > 0 && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                completedCount === allTopicIds.length && completedCount > 0
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-surface-deep text-ink-faint"
              }`}
            >
              {completedCount}/{allTopicIds.length}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 text-ink-faint transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-3 border-t border-line px-5 pb-5 pt-4">
          {month.weeks.map((week) => {
            const weekOpen = openWeeks.has(week.id);
            const weekTopicIds = week.topics.map((t) => topicId(week.id, t));
            const weekCompleted = weekTopicIds.filter((id) => completed.has(id)).length;
            const weekActive = weekTopicIds.filter((id) => {
              const state = topicStates[id];
              return !state || state.status !== "hidden";
            }).length;

            return (
              <div key={week.id} className="overflow-hidden rounded-xl border border-line">
                <button
                  type="button"
                  onClick={() => toggleWeek(week.id)}
                  aria-expanded={weekOpen}
                  className="flex w-full items-center justify-between gap-4 bg-surface px-4 py-3 text-left text-sm font-semibold transition-colors hover:bg-surface-deep"
                >
                  <span>{week.title}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    {hydrated && weekActive > 0 && (
                      <span className="text-xs text-ink-faint">
                        {weekCompleted}/{weekActive}
                      </span>
                    )}
                    <ChevronDown
                      className={`h-3.5 w-3.5 text-ink-faint transition-transform duration-200 ${weekOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                </button>
                {weekOpen && (
                  <WeekPanel
                    week={week}
                    trackKey={trackKey}
                    topicStates={topicStates}
                    completed={completed}
                    hydrated={hydrated}
                    onToggle={onToggle}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ComputerTrainingExplorer({ topicStates = {} }: ComputerTrainingExplorerProps) {
  const [track, setTrack] = useState<Track>("3m");
  const { completed: completed3m, hydrated: hydrated3m, toggle: toggle3m } = useTopicProgress("ct_3m");
  const { completed: completed6m, hydrated: hydrated6m, toggle: toggle6m } = useTopicProgress("ct_6m");

  const months = track === "3m" ? CT_THREE_MONTH : CT_SIX_MONTH;
  const completed = track === "3m" ? completed3m : completed6m;
  const hydrated = track === "3m" ? hydrated3m : hydrated6m;
  const onToggle = track === "3m" ? toggle3m : toggle6m;

  // Overall progress for the current track
  const allTopicIds = months.flatMap((mo) =>
    mo.weeks.flatMap((w) =>
      w.topics
        .map((t) => {
          const id = topicId(w.id, t);
          const state = topicStates[id];
          return state?.status === "hidden" ? null : id;
        })
        .filter((id): id is string => id !== null)
    )
  );
  const totalChecked = allTopicIds.filter((id) => completed.has(id)).length;
  const totalActive = allTopicIds.length;
  const overallPct = totalActive > 0 ? Math.round((totalChecked / totalActive) * 100) : 0;

  return (
    <div>
      {/* Track toggle + progress */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setTrack("3m")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              track === "3m" ? "bg-white text-blue shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            3 Month
          </button>
          <button
            type="button"
            onClick={() => setTrack("6m")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              track === "6m" ? "bg-white text-blue shadow-sm" : "text-ink-soft hover:text-ink"
            }`}
          >
            6 Month
          </button>
        </div>
        {hydrated && totalActive > 0 && (
          <div className="flex items-center gap-3">
            <div
              className="h-2 w-32 rounded-full bg-surface-deep"
              role="progressbar"
              aria-label={`${track === "3m" ? "3-month" : "6-month"} program progress`}
              aria-valuenow={overallPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full rounded-full bg-blue transition-[width] duration-300"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <span className="text-sm text-ink-faint">
              {totalChecked}/{totalActive} topics
            </span>
          </div>
        )}
      </div>

      {/* Months accordion */}
      <div className="flex flex-col gap-3">
        {months.map((month) => (
          <MonthAccordion
            key={month.id}
            month={month}
            trackKey={`ct_${track}`}
            topicStates={topicStates}
            completed={completed}
            hydrated={hydrated}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* Assessment table */}
      <div className="mt-10 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-4">
          <h3 className="font-semibold text-ink">Assessment Structure</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface text-xs font-bold uppercase tracking-wider text-ink-faint">
              <th className="px-6 py-3 text-left">Assessment</th>
              <th className="px-6 py-3 text-right">Weight</th>
            </tr>
          </thead>
          <tbody>
            {CT_ASSESSMENT.map((row, i) => (
              <tr key={row.label} className={i < CT_ASSESSMENT.length - 1 ? "border-b border-line" : ""}>
                <td className="px-6 py-3 text-sm text-ink-soft">{row.label}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-ink">{row.percentage}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-surface">
              <td className="px-6 py-3 text-sm font-bold text-ink">Total</td>
              <td className="px-6 py-3 text-right text-sm font-bold text-blue">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Grading scale */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="border-b border-line px-6 py-4">
          <h3 className="font-semibold text-ink">Grading Scale</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface text-xs font-bold uppercase tracking-wider text-ink-faint">
              <th className="px-6 py-3 text-left">Score</th>
              <th className="px-6 py-3 text-left">Grade</th>
            </tr>
          </thead>
          <tbody>
            {CT_GRADING.map((row, i) => (
              <tr key={row.range} className={i < CT_GRADING.length - 1 ? "border-b border-line" : ""}>
                <td className="px-6 py-3 text-sm font-semibold text-ink">{row.range}</td>
                <td className="px-6 py-3 text-sm text-ink-soft">{row.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Outcomes */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6">
          <h3 className="font-semibold text-ink">After 3 Months</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {CT_OUTCOMES_3M.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-line bg-white p-6">
          <h3 className="font-semibold text-ink">After 6 Months</h3>
          <ul className="mt-4 flex flex-col gap-2">
            {CT_OUTCOMES_6M.map((outcome) => (
              <li key={outcome} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
