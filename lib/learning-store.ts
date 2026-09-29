import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { getDatabasePool, withTransaction } from "@/lib/database";
import { HttpError } from "@/lib/http";
import { requireTeacher, type LearningUser } from "@/lib/learning-session";
import { scoreQuiz, type LearningAction, type QuizQuestion } from "@/lib/learning-schema";
import { aiFoundationsCourse } from "@/lib/ai-foundations-course";

export interface ClassSummary {
  id: string; slug: string; title: string; description: string; status: string;
  instructor: string; lesson_count: number; completed_count: number; enrolled: boolean;
  next_lesson_id?: string | null; next_lesson_title?: string | null;
}
export interface LessonSummary {
  id: string; title: string; position: number; completed: boolean; assignment_id: string; grade: number | null;
}
export interface Submission {
  id: string; body: string; answers: number[]; auto_score: number | null; grade: number | null;
  feedback: string; grading_source: string | null; version: number; submitted_at: string;
}
export interface LessonDetail {
  id: string; title: string; content: string; class_title: string; class_slug: string; class_id: string;
  assignment_id: string; kind: "written" | "quiz"; prompt: string;
  questions: Array<Omit<QuizQuestion, "correctIndex">>; completed: boolean; submission: Submission | null;
}

export async function learningCatalog(userId: string | null): Promise<ClassSummary[]> {
  const result = await getDatabasePool().query<ClassSummary>(
    `SELECT c.id, c.slug, c.title, c.description, c.status, u.name AS instructor,
      (SELECT count(*)::int FROM learning_lessons l WHERE l.class_id = c.id AND l.published) AS lesson_count,
      (SELECT count(*)::int FROM learning_progress p JOIN learning_lessons l ON l.id = p.lesson_id
        WHERE l.class_id = c.id AND l.published AND p.user_id = $1) AS completed_count,
      EXISTS(SELECT 1 FROM learning_enrollments e WHERE e.class_id = c.id AND e.user_id = $1) AS enrolled,
      next_lesson.id AS next_lesson_id, next_lesson.title AS next_lesson_title
     FROM learning_classes c JOIN learning_users u ON u.id = c.instructor_id
     LEFT JOIN LATERAL (
       SELECT l.id, l.title
       FROM learning_lessons l
       WHERE l.class_id = c.id AND l.published
         AND EXISTS(SELECT 1 FROM learning_enrollments e WHERE e.class_id = c.id AND e.user_id = $1)
         AND NOT EXISTS(SELECT 1 FROM learning_progress p WHERE p.lesson_id = l.id AND p.user_id = $1)
       ORDER BY l.position
       LIMIT 1
     ) next_lesson ON true
     WHERE c.status = 'published' ORDER BY c.created_at DESC LIMIT 100`, [userId],
  );
  return result.rows;
}

export async function learningClass(slug: string, user: LearningUser) {
  const found = await getDatabasePool().query<ClassSummary>(
    `SELECT c.id, c.slug, c.title, c.description, c.status, u.name AS instructor,
      EXISTS(SELECT 1 FROM learning_enrollments e WHERE e.class_id = c.id AND e.user_id = $2) AS enrolled
     FROM learning_classes c JOIN learning_users u ON u.id = c.instructor_id
     WHERE c.slug = $1 AND (c.status = 'published' OR c.instructor_id = $2 OR $3)`, [slug, user.id, user.role === "admin"],
  );
  if (!found.rows[0]) throw new HttpError(404, "Class not found.");
  const course = found.rows[0];
  const lessons = await getDatabasePool().query<LessonSummary>(
    `SELECT l.id, l.title, l.position, a.id AS assignment_id, s.grade,
      EXISTS(SELECT 1 FROM learning_progress p WHERE p.lesson_id = l.id AND p.user_id = $2) AS completed
     FROM learning_lessons l JOIN learning_assignments a ON a.lesson_id = l.id
     LEFT JOIN learning_submissions s ON s.assignment_id = a.id AND s.user_id = $2
     WHERE l.class_id = $1 AND l.published ORDER BY l.position`, [course.id, user.id],
  );
  return { course, lessons: lessons.rows };
}

export async function learningLesson(lessonId: string, user: LearningUser): Promise<LessonDetail> {
  const result = await getDatabasePool().query<Omit<LessonDetail, "submission" | "questions"> & { questions: QuizQuestion[] }>(
    `SELECT l.id, l.title, l.content, c.title AS class_title, c.slug AS class_slug, c.id AS class_id,
      a.id AS assignment_id, a.kind, a.prompt, a.questions,
      EXISTS(SELECT 1 FROM learning_progress p WHERE p.lesson_id = l.id AND p.user_id = $2) AS completed
     FROM learning_lessons l JOIN learning_classes c ON c.id = l.class_id
     JOIN learning_assignments a ON a.lesson_id = l.id
     WHERE l.id = $1 AND l.published AND c.status = 'published'
       AND EXISTS(SELECT 1 FROM learning_enrollments e WHERE e.class_id = c.id AND e.user_id = $2)`, [lessonId, user.id],
  );
  const lesson = result.rows[0];
  if (!lesson) throw new HttpError(404, "Lesson not found. Enroll in the class to begin.");
  const submission = await getDatabasePool().query<Submission>(
    `SELECT id, body, answers, auto_score, grade, feedback, grading_source, version, submitted_at::text
     FROM learning_submissions WHERE assignment_id = $1 AND user_id = $2`, [lesson.assignment_id, user.id],
  );
  return { ...lesson, questions: lesson.questions.map(({ prompt, options }) => ({ prompt, options })), submission: submission.rows[0] ?? null };
}

async function ownClass(client: PoolClient, classId: string, user: LearningUser) {
  requireTeacher(user);
  const result = await client.query(
    "SELECT id FROM learning_classes WHERE id = $1 AND (instructor_id = $2 OR $3) FOR UPDATE",
    [classId, user.id, user.role === "admin"],
  );
  if (!result.rowCount) throw new HttpError(404, "Class not found.");
}

async function audit(client: PoolClient, actorId: string, action: string, resourceId: string, details: object = {}) {
  await client.query("INSERT INTO learning_audit (id, actor_id, action, resource_id, details) VALUES ($1, $2, $3, $4, $5)",
    [randomUUID(), actorId, action, resourceId, JSON.stringify(details)]);
}

export async function applyLearningAction(user: LearningUser, input: LearningAction) {
  return withTransaction(async (client) => {
    switch (input.action) {
      case "update-lesson": {
        requireTeacher(user);
        const found = await client.query<{class_id:string; status:string}>("SELECT l.class_id, c.status FROM learning_lessons l JOIN learning_classes c ON c.id = l.class_id WHERE l.id = $1 AND (c.instructor_id = $2 OR $3) FOR UPDATE OF c", [input.lessonId, user.id, user.role === "admin"]);
        if (!found.rows[0]) throw new HttpError(404, "Lesson not found.");
        if (found.rows[0].status !== "draft") throw new HttpError(409, "Published lessons are fixed so existing submissions keep their original assignment.");
        await client.query("UPDATE learning_lessons SET title = $2, content = $3 WHERE id = $1", [input.lessonId, input.title, input.content]);
        await client.query("UPDATE learning_assignments SET prompt = $2 WHERE lesson_id = $1", [input.lessonId, input.prompt]);
        await audit(client, user.id, "draft_lesson_updated", input.lessonId);
        return { success: true };
      }
      case "create-ai-course": {
        requireTeacher(user);
        const id = randomUUID();
        const slug = `ai-foundations-${id.slice(0, 8)}`;
        await client.query("INSERT INTO learning_classes (id, slug, title, description, instructor_id) VALUES ($1, $2, $3, $4, $5)", [id, slug, aiFoundationsCourse.title, aiFoundationsCourse.description, user.id]);
        for (const [position, lesson] of aiFoundationsCourse.lessons.entries()) {
          const lessonId = randomUUID();
          await client.query("INSERT INTO learning_lessons (id, class_id, title, content, position) VALUES ($1, $2, $3, $4, $5)", [lessonId, id, lesson.title, lesson.content, position]);
          await client.query("INSERT INTO learning_assignments (id, lesson_id, kind, prompt, questions) VALUES ($1, $2, $3, $4, $5)", [randomUUID(), lessonId, lesson.kind, lesson.prompt, JSON.stringify(lesson.questions)]);
        }
        await audit(client, user.id, "course_template_created", id, { template: "ai-foundations-v1" });
        return { success: true, id, slug };
      }
      case "enroll": {
        const course = await client.query("SELECT id FROM learning_classes WHERE id = $1 AND status = 'published' FOR SHARE", [input.classId]);
        if (!course.rowCount) throw new HttpError(404, "Class not found.");
        await client.query("INSERT INTO learning_enrollments (user_id, class_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, input.classId]);
        return { success: true };
      }
      case "progress": {
        const allowed = await client.query(
          `SELECT l.id FROM learning_lessons l JOIN learning_classes c ON c.id = l.class_id
           JOIN learning_enrollments e ON e.class_id = c.id AND e.user_id = $2
           WHERE l.id = $1 AND l.published AND c.status = 'published'`, [input.lessonId, user.id],
        );
        if (!allowed.rowCount) throw new HttpError(404, "Lesson not found.");
        if (input.completed) await client.query("INSERT INTO learning_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, input.lessonId]);
        else await client.query("DELETE FROM learning_progress WHERE user_id = $1 AND lesson_id = $2", [user.id, input.lessonId]);
        return { success: true };
      }
      case "submit": {
        const found = await client.query<{ kind: string; questions: QuizQuestion[] }>(
          `SELECT a.kind, a.questions FROM learning_assignments a JOIN learning_lessons l ON l.id = a.lesson_id
           JOIN learning_classes c ON c.id = l.class_id JOIN learning_enrollments e ON e.class_id = c.id AND e.user_id = $2
           WHERE a.id = $1 AND l.published AND c.status = 'published' FOR SHARE OF a`, [input.assignmentId, user.id],
        );
        const assignment = found.rows[0];
        if (!assignment) throw new HttpError(404, "Assignment not found.");
        let score: number | null = null;
        if (assignment.kind === "quiz") {
          try { score = scoreQuiz(assignment.questions, input.answers); }
          catch { throw new HttpError(400, "Answer every question before submitting."); }
        } else if (input.body.length < 20) throw new HttpError(400, "Write at least 20 characters before submitting.");
        const id = randomUUID();
        const saved = await client.query<{ id: string }>(
          `INSERT INTO learning_submissions (id, assignment_id, user_id, body, answers, auto_score, grade, grading_source, graded_at)
           VALUES ($1, $2, $3, $4, $5, $6, $6, CASE WHEN $6::int IS NULL THEN NULL ELSE 'automatic' END, CASE WHEN $6::int IS NULL THEN NULL ELSE now() END)
           ON CONFLICT (assignment_id, user_id) DO UPDATE SET body = EXCLUDED.body, answers = EXCLUDED.answers,
             submitted_at = now(), version = learning_submissions.version + 1
           WHERE learning_submissions.grade IS NULL RETURNING id`,
          [id, input.assignmentId, user.id, assignment.kind === "written" ? input.body : "", JSON.stringify(assignment.kind === "quiz" ? input.answers : []), score],
        );
        if (!saved.rowCount) throw new HttpError(409, "This submission has been graded and cannot be changed.");
        await audit(client, user.id, "assignment_submitted", saved.rows[0].id, { automaticScore: score });
        return { success: true, score };
      }
      case "grade": {
        requireTeacher(user);
        const found = await client.query<{ grade: number | null; version: number }>(
          `SELECT s.grade, s.version FROM learning_submissions s JOIN learning_assignments a ON a.id = s.assignment_id
           JOIN learning_lessons l ON l.id = a.lesson_id JOIN learning_classes c ON c.id = l.class_id
           WHERE s.id = $1 AND (c.instructor_id = $2 OR $3) FOR UPDATE OF s`, [input.submissionId, user.id, user.role === "admin"],
        );
        const old = found.rows[0];
        if (!old) throw new HttpError(404, "Submission not found.");
        if (old.version !== input.version) throw new HttpError(409, "This submission changed. Refresh before grading it.");
        await client.query(
          `UPDATE learning_submissions SET grade = $2, feedback = $3, grading_source = 'teacher', graded_by = $4,
           graded_at = now(), version = version + 1 WHERE id = $1`, [input.submissionId, input.grade, input.feedback, user.id],
        );
        await audit(client, user.id, "grade_recorded", input.submissionId, { previousGrade: old.grade, grade: input.grade });
        return { success: true };
      }
      case "create-class": {
        requireTeacher(user);
        const id = randomUUID();
        const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70) || "class"}-${id.slice(0, 8)}`;
        await client.query("INSERT INTO learning_classes (id, slug, title, description, instructor_id) VALUES ($1, $2, $3, $4, $5)", [id, slug, input.title, input.description, user.id]);
        await audit(client, user.id, "class_created", id);
        return { success: true, id, slug };
      }
      case "publish-class": {
        await ownClass(client, input.classId, user);
        const lessons = await client.query("SELECT id FROM learning_lessons WHERE class_id = $1 AND published LIMIT 1", [input.classId]);
        if (!lessons.rowCount) throw new HttpError(400, "Add a lesson before publishing this class.");
        await client.query("UPDATE learning_classes SET status = 'published' WHERE id = $1", [input.classId]);
        await audit(client, user.id, "class_published", input.classId);
        return { success: true };
      }
      case "create-lesson": {
        await ownClass(client, input.classId, user);
        if (input.kind === "quiz" && input.questions.length === 0) throw new HttpError(400, "Add at least one quiz question.");
        const order = await client.query<{ position: number }>("SELECT coalesce(max(position), -1) + 1 AS position FROM learning_lessons WHERE class_id = $1", [input.classId]);
        const id = randomUUID();
        await client.query("INSERT INTO learning_lessons (id, class_id, title, content, position) VALUES ($1, $2, $3, $4, $5)", [id, input.classId, input.title, input.content, order.rows[0].position]);
        await client.query("INSERT INTO learning_assignments (id, lesson_id, kind, prompt, questions) VALUES ($1, $2, $3, $4, $5)", [randomUUID(), id, input.kind, input.prompt, JSON.stringify(input.kind === "quiz" ? input.questions : [])]);
        await audit(client, user.id, "lesson_created", id);
        return { success: true, id };
      }
    }
  });
}

export async function teachingClasses(user: LearningUser) {
  requireTeacher(user);
  const result = await getDatabasePool().query<{ id: string; slug: string; title: string; status: string; learners: number; pending: number }>(
    `SELECT c.id, c.slug, c.title, c.status,
      (SELECT count(*)::int FROM learning_enrollments e WHERE e.class_id = c.id) AS learners,
      (SELECT count(*)::int FROM learning_submissions s JOIN learning_assignments a ON a.id = s.assignment_id
        JOIN learning_lessons l ON l.id = a.lesson_id WHERE l.class_id = c.id AND s.grade IS NULL) AS pending
     FROM learning_classes c WHERE c.instructor_id = $1 OR $2 ORDER BY c.created_at DESC LIMIT 100`, [user.id, user.role === "admin"],
  );
  return result.rows;
}

export async function teachingClass(id: string, user: LearningUser) {
  requireTeacher(user);
  const courseResult = await getDatabasePool().query<{ id: string; slug: string; title: string; description: string; status: string }>(
    "SELECT id, slug, title, description, status FROM learning_classes WHERE id = $1 AND (instructor_id = $2 OR $3)", [id, user.id, user.role === "admin"],
  );
  const course = courseResult.rows[0];
  if (!course) throw new HttpError(404, "Class not found.");
  const [lessons, submissions, roster] = await Promise.all([
    getDatabasePool().query<{ id: string; title: string; content: string; prompt: string; kind: string; questions: QuizQuestion[] }>(
      "SELECT l.id, l.title, l.content, a.prompt, a.kind, a.questions FROM learning_lessons l JOIN learning_assignments a ON a.lesson_id = l.id WHERE l.class_id = $1 ORDER BY l.position", [id]),
    getDatabasePool().query<Submission & { learner: string; lesson: string; kind: string; prompt: string; questions: QuizQuestion[] }>(
      `SELECT s.id, s.body, s.answers, s.auto_score, s.grade, s.feedback, s.grading_source, s.version, s.submitted_at::text,
        u.name AS learner, l.title AS lesson, a.kind, a.prompt, a.questions
       FROM learning_submissions s JOIN learning_users u ON u.id = s.user_id
       JOIN learning_assignments a ON a.id = s.assignment_id JOIN learning_lessons l ON l.id = a.lesson_id
       WHERE l.class_id = $1 ORDER BY s.grade NULLS FIRST, s.submitted_at DESC LIMIT 100`, [id]),
    getDatabasePool().query<{ name: string; completed: number }>(
      `SELECT u.name, (SELECT count(*)::int FROM learning_progress p JOIN learning_lessons l ON l.id = p.lesson_id
        WHERE p.user_id = u.id AND l.class_id = $1) AS completed
       FROM learning_enrollments e JOIN learning_users u ON u.id = e.user_id
       WHERE e.class_id = $1 ORDER BY e.created_at DESC LIMIT 100`, [id]),
  ]);
  return { course, lessons: lessons.rows, submissions: submissions.rows, roster: roster.rows };
}
