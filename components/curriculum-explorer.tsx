"use client";

import {
  Cloud,
  Code2,
  Compass,
  Eye,
  GitBranch,
  Hammer,
  LineChart,
  Rocket,
  TestTube2,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AI_PHASES } from "@/lib/curriculum-data";
import { useTopicProgress } from "@/lib/use-topic-progress";
import type { CurriculumTopicState } from "@/lib/curriculum-store";

const PHASE_ICONS: Record<string, LucideIcon> = {
  Compass,
  Eye,
  Code2,
  Hammer,
  TestTube2,
  GitBranch,
  Rocket,
  Cloud,
  LineChart,
};

interface CurriculumExplorerProps {
  /** Tutor-controlled topic states from the DB (empty map = all active) */
  topicStates?: Record<string, CurriculumTopicState>;
}

// Build a stable topic ID from phase id and topic string
function topicId(phaseId: string, topic: string) {
  return `${phaseId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

type LoopPoint = { x: number; y: number };

function buildLoopPath(points: LoopPoint[], width: number, height: number) {
  if (points.length < 9 || width === 0 || height === 0) return "";
  const [p0, p1, p2, , , p5, , , p8] = points;
  const p3 = points[3];
  const p4 = points[4];
  const p6 = points[6];
  const p7 = points[7];
  const turn = Math.min(width, height) * 0.16;

  return [
    `M ${p0.x} ${p0.y}`,
    `L ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `Q ${p2.x + turn} ${(p2.y + p5.y) / 2} ${p5.x} ${p5.y}`,
    `L ${p4.x} ${p4.y}`,
    `L ${p3.x} ${p3.y}`,
    `Q ${p3.x - turn} ${(p3.y + p6.y) / 2} ${p6.x} ${p6.y}`,
    `L ${p7.x} ${p7.y}`,
    `L ${p8.x} ${p8.y}`,
    `C ${p8.x} ${p8.y + height * 0.26}, ${p0.x - width * 0.24} ${p0.y + height * 0.1}, ${p0.x} ${p0.y}`,
  ].join(" ");
}

function PhaseList({
  active,
  onSelect,
  topicStates,
  completed,
}: {
  active: number;
  onSelect: (index: number) => void;
  topicStates: Record<string, CurriculumTopicState>;
  completed: Set<string>;
}) {
  return (
    <div className="flex flex-col gap-1">
      {AI_PHASES.map((item, index) => {
        const isActive = index === active;
        // Count only active topics for the pill
        const activeTopics = item.topics.filter((t) => {
          const id = topicId(item.id, t);
          const state = topicStates[id];
          return !state || state.status !== "hidden";
        });
        const completedCount = activeTopics.filter((t) =>
          completed.has(topicId(item.id, t))
        ).length;
        return (
          <button
            key={item.name}
            type="button"
            onClick={() => onSelect(index)}
            aria-pressed={isActive}
            className={`group flex items-baseline gap-4 rounded-xl px-4 py-3 text-left transition-colors ${
              isActive ? "bg-surface" : "hover:bg-surface/60"
            }`}
          >
            <span
              className={`text-sm font-bold tabular-nums ${isActive ? "text-blue" : "text-ink-faint"}`}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex-1">
              <span
                className={`block text-lg font-bold ${isActive ? "text-blue" : "text-ink"}`}
              >
                {item.name}
              </span>
              <span
                className={`block overflow-hidden text-sm text-ink-soft transition-all duration-300 ${
                  isActive ? "mt-1 max-h-16 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {item.detail}
              </span>
            </span>
            {activeTopics.length > 0 && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  completedCount === activeTopics.length && completedCount > 0
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-surface-deep text-ink-faint"
                }`}
              >
                {completedCount}/{activeTopics.length}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PhaseGrid({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (index: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [path, setPath] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const containerRect = container.getBoundingClientRect();
      const points = cellRefs.current.map((cell) => {
        if (!cell) return { x: 0, y: 0 };
        const rect = cell.getBoundingClientRect();
        return {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2,
        };
      });
      setPath(buildLoopPath(points, containerRect.width, containerRect.height));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative px-2 pb-10">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="loop-connector-gradient-exp"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--blue)" />
            <stop offset="33%" stopColor="var(--yellow)" />
            <stop offset="66%" stopColor="var(--red)" />
            <stop offset="100%" stopColor="var(--blue)" />
          </linearGradient>
        </defs>
        {path ? (
          <>
            <path
              d={path}
              fill="none"
              stroke="var(--line)"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <path
              id="loop-connector-path-exp"
              d={path}
              fill="none"
              stroke="url(#loop-connector-gradient-exp)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeDasharray="16 12"
              className="loop-connector-flow"
            />
            {[0, 0.33, 0.66].map((offset) => (
              <circle
                key={offset}
                r={5}
                fill="var(--blue)"
                className="loop-connector-dot"
              >
                <animateMotion
                  dur="6s"
                  begin={`${offset * -6}s`}
                  repeatCount="indefinite"
                >
                  <mpath href="#loop-connector-path-exp" />
                </animateMotion>
              </circle>
            ))}
          </>
        ) : null}
      </svg>
      <div className="relative grid grid-cols-3 gap-4 sm:gap-6">
        {AI_PHASES.map((item, index) => {
          const isActive = index === active;
          const Icon = PHASE_ICONS[item.iconName];
          return (
            <button
              key={item.name}
              ref={(node) => {
                cellRefs.current[index] = node;
              }}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={isActive}
              aria-label={`${item.name}: ${item.detail}`}
              className={`glow-border relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-transform hover:-translate-y-0.5 ${
                isActive
                  ? "border-blue ring-2 ring-blue ring-offset-2"
                  : "border-line"
              }`}
            >
              <span className="relative block aspect-square w-full">
                <Image
                  src={item.image}
                  alt={`Illustration of the ${item.name} phase: ${item.detail}`}
                  fill
                  sizes="(min-width: 1024px) 20vw, 33vw"
                  className="object-cover"
                />
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-2">
                {Icon && (
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-blue" : "text-ink-faint"}`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`truncate text-xs font-bold ${isActive ? "text-blue" : "text-ink"}`}
                >
                  {item.name}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CurriculumExplorer({ topicStates = {} }: CurriculumExplorerProps) {
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const firstCheckboxRef = useRef<HTMLInputElement | null>(null);
  const { completed, hydrated, toggle } = useTopicProgress("ai");

  useEffect(() => {
    if (pinned) return;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % AI_PHASES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [pinned]);

  const handleSelect = (index: number) => {
    if (active === index) {
      setPanelOpen((open) => !open);
    } else {
      setActive(index);
      setPinned(true);
      setPanelOpen(true);
    }
  };

  // Move focus to first checkbox when panel opens
  useEffect(() => {
    if (panelOpen && firstCheckboxRef.current) {
      firstCheckboxRef.current.focus();
    }
  }, [panelOpen, active]);

  const currentPhase = AI_PHASES[active];

  // Compute total active topics across all phases for overall progress bar
  const allActiveTopics: string[] = [];
  for (const phase of AI_PHASES) {
    for (const t of phase.topics) {
      const id = topicId(phase.id, t);
      const state = topicStates[id];
      if (!state || state.status !== "hidden") {
        allActiveTopics.push(id);
      }
    }
  }
  const totalChecked = allActiveTopics.filter((id) => completed.has(id)).length;
  const totalActive = allActiveTopics.length;
  const overallPct =
    totalActive > 0 ? Math.round((totalChecked / totalActive) * 100) : 0;

  // Current phase's visible topics
  const visibleTopics = currentPhase.topics
    .map((t) => {
      const id = topicId(currentPhase.id, t);
      const state = topicStates[id];
      return { topic: t, id, status: state?.status ?? "active" };
    })
    .filter((t) => t.status !== "hidden");

  return (
    <div>
      {/* Overall progress bar */}
      {hydrated && totalActive > 0 && (
        <div className="mb-8">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">Your Progress</span>
            <span className="text-ink-faint">
              {totalChecked} / {totalActive} topics
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-surface-deep"
            role="progressbar"
            aria-label="Overall curriculum progress"
            aria-valuenow={overallPct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-blue transition-[width] duration-300"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-start">
        <PhaseList
          active={active}
          onSelect={handleSelect}
          topicStates={topicStates}
          completed={completed}
        />
        <div>
          <PhaseGrid active={active} onSelect={handleSelect} />

          {/* Topic detail panel */}
          <div
            className={`overflow-hidden transition-[max-height,opacity] ${
              panelOpen
                ? "max-h-[2000px] opacity-100 motion-reduce:max-h-none"
                : "max-h-0 opacity-0"
            }`}
            style={{ transitionDuration: panelOpen ? "400ms" : "200ms" }}
          >
            <div className="mt-2 rounded-2xl border border-line bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-ink">
                    {currentPhase.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {currentPhase.detail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  aria-label="Close topic list"
                  className="shrink-0 rounded-lg p-1 text-ink-faint transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <ul className="mt-5 flex flex-col gap-2">
                {visibleTopics.map(({ topic, id, status }, idx) => {
                  if (status === "coming-soon") {
                    return (
                      <li
                        key={id}
                        className="flex items-center gap-3 text-sm text-ink-faint"
                      >
                        <span
                          className="h-4 w-4 shrink-0 rounded border border-line bg-surface"
                          aria-hidden="true"
                        />
                        <span>{topic}</span>
                        <span className="ml-auto rounded-full bg-surface-deep px-2 py-0.5 text-xs font-semibold">
                          Coming soon
                        </span>
                      </li>
                    );
                  }
                  const checked = hydrated && completed.has(id);
                  return (
                    <li key={id}>
                      <label className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface">
                        <input
                          ref={idx === 0 ? firstCheckboxRef : undefined}
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                          className="h-4 w-4 shrink-0 accent-[oklch(55%_0.22_262)]"
                        />
                        <span
                          className={
                            checked ? "line-through text-ink-faint" : "text-ink"
                          }
                        >
                          {topic}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
