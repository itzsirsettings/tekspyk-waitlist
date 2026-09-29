import { NextResponse } from "next/server";
import { hasAdminSession } from "@/lib/admin-session";
import { isSameOrigin } from "@/lib/admin-auth";
import { readJson, apiError } from "@/lib/http";
import {
  getCurriculumTopicStates,
  upsertTopicState,
  type CurriculumTopicState,
} from "@/lib/curriculum-store";
import { AI_PHASES } from "@/lib/curriculum-data";
import { CT_THREE_MONTH, CT_SIX_MONTH } from "@/lib/computer-training-data";
import {
  curriculumPatchSchema,
  type CurriculumPatch,
} from "@/lib/curriculum-patch-schema";

// Re-export so consumers can import from either location
export { curriculumPatchSchema, type CurriculumPatch };

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function checkAuth(): Promise<boolean> {
  return hasAdminSession();
}

// ─── Merge DB states with data ───────────────────────────────────────────────

interface TopicWithState {
  id: string;
  topic: string;
  status: CurriculumTopicState["status"];
  tutorNote: string | null;
  sortOrder: number;
}

interface PhaseWithState {
  id: string;
  name: string;
  topics: TopicWithState[];
}

interface MonthWithState {
  id: string;
  title: string;
  weeks: {
    id: string;
    title: string;
    topics: TopicWithState[];
  }[];
}

function aiTopicId(phaseId: string, topic: string) {
  return `${phaseId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function ctTopicId(weekId: string, topic: string) {
  return `ct_${weekId}_${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function buildAiPayload(
  stateMap: Map<string, CurriculumTopicState>
): PhaseWithState[] {
  return AI_PHASES.map((phase) => ({
    id: phase.id,
    name: phase.name,
    topics: phase.topics.map((topic) => {
      const id = aiTopicId(phase.id, topic);
      const state = stateMap.get(id);
      return {
        id,
        topic,
        status: state?.status ?? "active",
        tutorNote: state?.tutorNote ?? null,
        sortOrder: state?.sortOrder ?? 0,
      };
    }),
  }));
}

function buildCtPayload(
  months: typeof CT_THREE_MONTH,
  stateMap: Map<string, CurriculumTopicState>
): MonthWithState[] {
  return months.map((month) => ({
    id: month.id,
    title: month.title,
    weeks: month.weeks.map((week) => ({
      id: week.id,
      title: week.title,
      topics: week.topics.map((topic) => {
        const id = ctTopicId(week.id, topic);
        const state = stateMap.get(id);
        return {
          id,
          topic,
          status: state?.status ?? "active",
          tutorNote: state?.tutorNote ?? null,
          sortOrder: state?.sortOrder ?? 0,
        };
      }),
    })),
  }));
}

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET() {
  try {
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stateMap = await getCurriculumTopicStates();

  return NextResponse.json({
    ai_engineering: buildAiPayload(stateMap),
    computer_training_3m: buildCtPayload(CT_THREE_MONTH, stateMap),
    computer_training_6m: buildCtPayload(CT_SIX_MONTH, stateMap),
  }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return apiError(error, "curriculum_read"); }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await checkAuth())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await readJson(request, 8192);
  } catch (error) {
    return apiError(error, "curriculum_input");
  }

  const parsed = curriculumPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { id, ...patch } = parsed.data;
  try {
    const updated = await upsertTopicState(id, patch);
    return NextResponse.json(updated, { headers: { "Cache-Control": "no-store" } });
  } catch {
    console.error("Admin curriculum update failed");
    return NextResponse.json({ error: "Unable to save this change." }, { status: 503 });
  }
}
