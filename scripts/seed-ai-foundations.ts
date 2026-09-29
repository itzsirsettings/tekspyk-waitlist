import { randomUUID } from "node:crypto";
import { checkServerIdentity } from "node:tls";
import nextEnv = require("@next/env");
import pg from "pg";
import { aiFoundationsCourse } from "../lib/ai-foundations-course";

nextEnv.loadEnvConfig(process.cwd());

const stage = process.env.DEPLOYMENT_STAGE;
if (stage !== "staging" && stage !== "production") {
  throw new Error("Set DEPLOYMENT_STAGE to staging or production before seeding.");
}

const connectionString = process.env.DATABASE_URL;
const ca = process.env.DATABASE_SSL_CA?.replaceAll("\\n", "\n");
if (!connectionString || !ca || !process.env.DATABASE_SSL_SERVERNAME) {
  throw new Error("A Railway DATABASE_URL, DATABASE_SSL_CA, and DATABASE_SSL_SERVERNAME are required.");
}

const connectionUrl = new URL(connectionString);
if (process.env.DATABASE_TUNNEL_PORT) {
  const tunnelPort = Number(process.env.DATABASE_TUNNEL_PORT);
  if (!Number.isInteger(tunnelPort) || tunnelPort < 1024 || tunnelPort > 65535) {
    throw new Error("DATABASE_TUNNEL_PORT must be a valid local TCP port.");
  }
  connectionUrl.hostname = "127.0.0.1";
  connectionUrl.port = String(tunnelPort);
}

const client = new pg.Client({
  connectionString: connectionUrl.toString(),
  connectionTimeoutMillis: 15_000,
  query_timeout: 30_000,
  ssl: {
    ca,
    rejectUnauthorized: true,
    checkServerIdentity: (_, certificate) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME!, certificate),
  },
});

const author = {
  id: "system:tekspyk-course-team",
  name: "TekSpyk Learning Team",
  email: "course-team@example.test",
};
const slug = "ai-foundations";

async function main() {
try {
  await client.connect();
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`tekspyk:seed:${slug}:v1`]);

  const existing = await client.query<{ id: string; title: string; description: string; status: string; lesson_count: number; published_lesson_count: number; assignment_count: number }>(
    `SELECT c.id, c.title, c.description, c.status,
       count(DISTINCT l.id)::int AS lesson_count,
       (count(DISTINCT l.id) FILTER (WHERE l.published))::int AS published_lesson_count,
       count(DISTINCT a.id)::int AS assignment_count
     FROM learning_classes c
     LEFT JOIN learning_lessons l ON l.class_id = c.id
     LEFT JOIN learning_assignments a ON a.lesson_id = l.id
     WHERE c.slug = $1
     GROUP BY c.id`,
    [slug],
  );

  if (existing.rowCount) {
    const course = existing.rows[0];
    const expectedCount = aiFoundationsCourse.lessons.length;
    if (
      course.title !== aiFoundationsCourse.title ||
      course.description !== aiFoundationsCourse.description ||
      course.status !== "published" ||
      course.lesson_count !== expectedCount ||
      course.published_lesson_count !== expectedCount ||
      course.assignment_count !== expectedCount
    ) {
      throw new Error(`Existing ${slug} class is not the complete published starter course; refusing to alter it.`);
    }
    await client.query("COMMIT");
    console.log(JSON.stringify({ result: "already_seeded", stage, slug, lessons: course.lesson_count }));
  } else {
    const existingAuthor = await client.query<{ id: string; name: string; email: string; role: string }>(
      "SELECT id, name, email, role FROM learning_users WHERE id = $1 OR email = $2 FOR UPDATE",
      [author.id, author.email],
    );
    if (existingAuthor.rowCount && (existingAuthor.rowCount !== 1 || existingAuthor.rows[0].id !== author.id || existingAuthor.rows[0].name !== author.name || existingAuthor.rows[0].email !== author.email || existingAuthor.rows[0].role !== "teacher")) {
      throw new Error("The reserved curriculum identity already exists with different data; refusing to modify it.");
    }
    if (!existingAuthor.rowCount) {
      await client.query(
        `INSERT INTO learning_users (id, name, email, "emailVerified", role, "adultConfirmed", "termsAccepted")
         VALUES ($1, $2, $3, false, 'teacher', false, false)`,
        [author.id, author.name, author.email],
      );
    }

    const classId = randomUUID();
    await client.query(
      `INSERT INTO learning_classes (id, slug, title, description, instructor_id, status)
       VALUES ($1, $2, $3, $4, $5, 'published')`,
      [classId, slug, aiFoundationsCourse.title, aiFoundationsCourse.description, author.id],
    );

    for (const [position, lesson] of aiFoundationsCourse.lessons.entries()) {
      const lessonId = randomUUID();
      await client.query(
        "INSERT INTO learning_lessons (id, class_id, title, content, position, published) VALUES ($1, $2, $3, $4, $5, true)",
        [lessonId, classId, lesson.title, lesson.content, position],
      );
      await client.query(
        "INSERT INTO learning_assignments (id, lesson_id, kind, prompt, questions) VALUES ($1, $2, $3, $4, $5)",
        [randomUUID(), lessonId, lesson.kind, lesson.prompt, JSON.stringify(lesson.questions)],
      );
    }

    await client.query(
      "INSERT INTO learning_audit (id, actor_id, action, resource_id, details) VALUES ($1, $2, 'class_published', $3, $4)",
      [randomUUID(), author.id, classId, JSON.stringify({ template: "ai-foundations-v1", seeded: true, stage })],
    );

    const check = await client.query<{ lesson_count: number; published_lesson_count: number; assignment_count: number; status: string }>(
      `SELECT c.status, count(DISTINCT l.id)::int AS lesson_count,
         (count(DISTINCT l.id) FILTER (WHERE l.published))::int AS published_lesson_count,
         count(DISTINCT a.id)::int AS assignment_count
       FROM learning_classes c
       LEFT JOIN learning_lessons l ON l.class_id = c.id
       LEFT JOIN learning_assignments a ON a.lesson_id = l.id
       WHERE c.id = $1
       GROUP BY c.id`,
      [classId],
    );
    if (check.rows[0]?.status !== "published" || check.rows[0].lesson_count !== aiFoundationsCourse.lessons.length || check.rows[0].published_lesson_count !== aiFoundationsCourse.lessons.length || check.rows[0].assignment_count !== aiFoundationsCourse.lessons.length) {
      throw new Error("The starter class failed its in-transaction integrity check.");
    }

    await client.query("COMMIT");
    console.log(JSON.stringify({ result: "seeded", stage, slug, lessons: check.rows[0].lesson_count, assignments: check.rows[0].assignment_count }));
  }
} catch (error) {
  try { await client.query("ROLLBACK"); }
  catch { console.error("Rollback was unavailable after the seed operation failed."); }
  console.error(`Could not seed AI Foundations: ${error instanceof Error ? error.message : "unknown database error"}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
}

void main();
