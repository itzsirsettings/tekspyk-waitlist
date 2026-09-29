"use client";

import { ChevronDown, ChevronRight, CheckCircle2, Clock, EyeOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AI_PHASES } from "@/lib/curriculum-data";
import {
  CT_THREE_MONTH,
  CT_SIX_MONTH,
} from "@/lib/computer-training-data";
import type { CurriculumTopicState, TopicStatus } from "@/lib/curriculum-store";

type SubProgram = "ai" | "ct_3m" | "ct_6m";

interface TopicWithState {
  id: string;
  topic: string;
  status: TopicStatus;
  tutorNote: string | null;
}

interface PhaseOrMonth {
  id: string;
  name: string;
  topics: TopicWithState[];
}

function aiTopicId(phaseId: string, topic: string) {
  return `${phaseId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function ctTopicId(weekId: string, topic: string) {
  return `ct_${weekId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function buildAiPhases(stateMap: Map<string, CurriculumTopicState>): PhaseOrMonth[] {
  return AI_PHASES.map((phase) => ({
    id: phase.id,
    name: phase.name,
    topics: phase.topics.map((topic) => {
      const id = aiTopicId(phase.id, topic);
      const state = stateMap.get(id);
      return { id, topic, status: state?.status ?? "active", tutorNote: state?.tutorNote ?? null };
    }),
  }));
}

function buildCtMonths(
  months: typeof CT_THREE_MONTH,
  stateMap: Map<string, CurriculumTopicState>
): PhaseOrMonth[] {
  return months.map((month) => ({
    id: month.id,
    name: month.title,
    topics: month.weeks.flatMap((week) =>
      week.topics.map((topic) => {
        const id = ctTopicId(week.id, topic);
        const state = stateMap.get(id);
        return { id, topic, status: state?.status ?? "active", tutorNote: state?.tutorNote ?? null };
      })
    ),
  }));
}

const STATUS_LABELS: Record<TopicStatus, string> = {
  active: "Active",
  "coming-soon": "Coming Soon",
  hidden: "Hidden",
};

const STATUS_ICONS: Record<TopicStatus, React.ReactNode> = {
  active: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />,
  "coming-soon": <Clock className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />,
  hidden: <EyeOff className="h-3.5 w-3.5 text-ink-faint" aria-hidden="true" />,
};

interface TopicRowProps {
  item: TopicWithState;
  onSave: (id: string, patch: { status?: TopicStatus; tutorNote?: string | null }) => Promise<void>;
}

function TopicRow({ item, onSave }: TopicRowProps) {
  const [status, setStatus] = useState<TopicStatus>(item.status);
  const [note, setNote] = useState(item.tutorNote ?? "");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const noteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (noteTimerRef.current) clearTimeout(noteTimerRef.current); }, []);

  const save = useCallback(
    async (patch: { status?: TopicStatus; tutorNote?: string | null }) => {
      setSaving(true);
      setError(null);
      try {
        await onSave(item.id, patch);
        setLastSaved(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed. Please retry.");
      } finally {
        setSaving(false);
      }
    },
    [item.id, onSave]
  );

  const handleStatusChange = (newStatus: TopicStatus) => {
    setStatus(newStatus);
    void save({ status: newStatus });
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    if (noteTimerRef.current) clearTimeout(noteTimerRef.current);
    noteTimerRef.current = setTimeout(() => {
      void save({ tutorNote: value || null });
    }, 600);
  };

  return (
    <div
      className={`rounded-xl border border-line bg-white p-4 transition-opacity ${
        status === "hidden" ? "opacity-40" : ""
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex flex-1 items-start gap-2">
          {STATUS_ICONS[status]}
          <span className="text-sm font-medium text-ink">{item.topic}</span>
          {status === "coming-soon" && (
            <span className="ml-1 shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
              Coming soon
            </span>
          )}
          {status === "hidden" && (
            <span className="ml-1 shrink-0 rounded-full bg-surface-deep px-2 py-0.5 text-xs font-semibold text-ink-faint">
              Hidden
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as TopicStatus)}
            disabled={saving}
            aria-label={`Status for ${item.topic}`}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink focus:border-blue focus:outline-none focus:ring-1 focus:ring-blue disabled:opacity-60"
          >
            {(["active", "coming-soon", "hidden"] as TopicStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {saving && (
            <span className="text-xs text-ink-faint">Saving...</span>
          )}
          {lastSaved && !saving && (
            <span className="text-xs text-ink-faint">
              Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>
      <div className="mt-3">
        <input
          type="text"
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder="Add tutor note (e.g. Covered in session 3)"
          maxLength={500}
          disabled={saving}
          aria-label={`Note for ${item.topic}`}
          className="h-9 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-blue focus:bg-white focus:outline-none disabled:opacity-60"
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface CurriculumAdminProps {
  initialStates: Record<string, CurriculumTopicState>;
}

export function CurriculumAdmin({ initialStates }: CurriculumAdminProps) {
  const [subProgram, setSubProgram] = useState<SubProgram>("ai");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [stateMap, setStateMap] = useState(new Map(Object.entries(initialStates)));
  const [refOpen, setRefOpen] = useState(false);

  const aiPhases = buildAiPhases(stateMap);
  const ct3mMonths = buildCtMonths(CT_THREE_MONTH, stateMap);
  const ct6mMonths = buildCtMonths(CT_SIX_MONTH, stateMap);

  const phases =
    subProgram === "ai" ? aiPhases : subProgram === "ct_3m" ? ct3mMonths : ct6mMonths;

  const selectedPhase = phases[selectedIndex] ?? phases[0];

  const handleSave = useCallback(
    async (id: string, patch: { status?: TopicStatus; tutorNote?: string | null }) => {
      const response = await fetch("/api/admin/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? "Save failed");
      }
      const updated = (await response.json()) as CurriculumTopicState;
      setStateMap((prev) => new Map(prev).set(updated.id, updated));
    },
    []
  );

  return (
    <div className="space-y-6">
      {/* Brand reference panel */}
      <details
        open={refOpen}
        onToggle={(e) => setRefOpen((e.target as HTMLDetailsElement).open)}
        className="rounded-2xl border border-line bg-white"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 font-semibold text-ink">
          <span>Brand Reference</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 ${refOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </summary>
        <div className="border-t border-line px-6 pb-6 pt-4">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Anti-references (avoid these)</p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
                {[
                  "Dark glassmorphism with cyan glows",
                  "Generic SaaS gradient-blob heroes",
                  "Eyebrow kicker labels above headings",
                  "Em-dashes anywhere in copy",
                  "Gradient text",
                ].map((refItem) => (
                  <li key={refItem} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pink" aria-hidden="true" />
                    {refItem}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-ink-faint">Copy rules</p>
              <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink-soft">
                {[
                  "Short, declarative sentences. No hype filler.",
                  "One idea per section.",
                  "No exclamation points in body copy.",
                  "Tutor notes: plain language, specific to the session.",
                  "Status: use Coming Soon for announced-but-not-ready topics.",
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue" aria-hidden="true" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </details>

      {/* Sub-program tabs */}
      <div className="flex flex-wrap gap-2">
        {([
          ["ai", "AI Engineering"],
          ["ct_3m", "Computer Training 3M"],
          ["ct_6m", "Computer Training 6M"],
        ] as [SubProgram, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setSubProgram(key); setSelectedIndex(0); }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              subProgram === key
                ? "bg-blue text-white"
                : "border border-line bg-white text-ink-soft hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        {/* Phase / month list */}
        <div className="flex flex-col gap-1 rounded-2xl border border-line bg-white p-2">
          {phases.map((phase, index) => {
            const isActive = index === selectedIndex;
            const hiddenCount = phase.topics.filter((t) => t.status === "hidden").length;
            const comingSoonCount = phase.topics.filter((t) => t.status === "coming-soon").length;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-blue/10 text-blue"
                    : "text-ink hover:bg-surface"
                }`}
              >
                <span className="text-sm font-semibold">{phase.name}</span>
                <div className="flex shrink-0 gap-1">
                  {hiddenCount > 0 && (
                    <span className="rounded-full bg-surface-deep px-1.5 text-[10px] font-bold text-ink-faint">
                      {hiddenCount} hidden
                    </span>
                  )}
                  {comingSoonCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-600">
                      {comingSoonCount} soon
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Topic rows */}
        <div className="flex flex-col gap-3">
          {selectedPhase ? (
            <>
              <div className="flex items-center gap-3">
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true" />
                <h3 className="font-semibold text-ink">{selectedPhase.name}</h3>
                <span className="text-sm text-ink-faint">{selectedPhase.topics.length} topics</span>
              </div>
              {selectedPhase.topics.map((topicItem) => (
                <TopicRow
                  key={topicItem.id}
                  item={topicItem}
                  onSave={handleSave}
                />
              ))}
            </>
          ) : (
            <p className="text-sm text-ink-soft">Select a phase to manage its topics.</p>
          )}
        </div>
      </div>
    </div>
  );
}
