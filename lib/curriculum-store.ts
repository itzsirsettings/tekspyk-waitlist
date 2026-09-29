import { getDatabasePool } from "@/lib/database";

export type TopicStatus = "active" | "coming-soon" | "hidden";

export interface CurriculumTopicState {
  id: string;
  program: string;
  phaseId: string;
  topic: string;
  status: TopicStatus;
  tutorNote: string | null;
  sortOrder: number;
  updatedAt: string;
}

interface TopicRow {
  id: string;
  program: string;
  phase_id: string;
  topic: string;
  status: TopicStatus;
  tutor_note: string | null;
  sort_order: number;
  updated_at: Date;
}

function toState(row: TopicRow): CurriculumTopicState {
  return {
    id: row.id,
    program: row.program,
    phaseId: row.phase_id,
    topic: row.topic,
    status: row.status,
    tutorNote: row.tutor_note,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : new Date(row.updated_at).toISOString(),
  };
}

export async function getCurriculumTopicStates(
  program?: string
): Promise<Map<string, CurriculumTopicState>> {
    const pool = getDatabasePool();
    const result = program
      ? await pool.query<TopicRow>(
          "SELECT id, program, phase_id, topic, status, tutor_note, sort_order, updated_at FROM curriculum_topics WHERE program = $1",
          [program]
        )
      : await pool.query<TopicRow>(
          "SELECT id, program, phase_id, topic, status, tutor_note, sort_order, updated_at FROM curriculum_topics"
        );
    const map = new Map<string, CurriculumTopicState>();
    for (const row of result.rows) {
      map.set(row.id, toState(row));
    }
    return map;
}

export async function upsertTopicState(
  id: string,
  patch: {
    program?: string;
    phaseId?: string;
    topic?: string;
    status?: TopicStatus;
    tutorNote?: string | null;
    sortOrder?: number;
  }
): Promise<CurriculumTopicState> {
  const pool = getDatabasePool();
  const result = await pool.query<TopicRow>(
    `INSERT INTO curriculum_topics (id, program, phase_id, topic, status, tutor_note, sort_order, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now())
     ON CONFLICT (id) DO UPDATE SET
       status = CASE WHEN $8 THEN EXCLUDED.status ELSE curriculum_topics.status END,
       tutor_note = CASE WHEN $9 THEN EXCLUDED.tutor_note ELSE curriculum_topics.tutor_note END,
       sort_order = CASE WHEN $10 THEN EXCLUDED.sort_order ELSE curriculum_topics.sort_order END,
       updated_at = now()
     RETURNING id, program, phase_id, topic, status, tutor_note, sort_order, updated_at`,
    [
      id,
      patch.program ?? "",
      patch.phaseId ?? "",
      patch.topic ?? "",
      patch.status ?? "active",
      patch.tutorNote ?? null,
      patch.sortOrder ?? 0,
      patch.status !== undefined,
      patch.tutorNote !== undefined,
      patch.sortOrder !== undefined,
    ]
  );
  return toState(result.rows[0]);
}
