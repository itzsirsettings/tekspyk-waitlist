import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";
import { setTimeout as pause } from "node:timers/promises";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { SMTPServer } from "smtp-server";
import { chromium, request } from "@playwright/test";
import pg from "pg";
import { checkServerIdentity } from "node:tls";

loadEnvConfig(process.cwd());
if (process.env.DEPLOYMENT_STAGE !== "staging") throw Error("These synthetic-account tests require DEPLOYMENT_STAGE=staging");
const baseURL = "http://localhost:3100";
const run = `e2e-${Date.now()}`;
const password = randomBytes(24).toString("base64url");
const messages = [];
const checks = [];
const accounts = [];
let clientNumber = 10;
let browser;
let app;
function safeMessage(value) {
  return String(value)
    .replace(/([?&]token=)[^&\s]+/gi, "$1[REDACTED]")
    .replace(/(better-auth\.session_token=)[^;\s]+/gi, "$1[REDACTED]")
    .replace(/(set-cookie:\s*)[^\r\n]+/gi, "$1[REDACTED]")
    .replace(/(password=)[^&\s]+/gi, "$1[REDACTED]");
}
const server = new SMTPServer({
  secure: false, disabledCommands: ["STARTTLS"],
  onAuth(_auth, _session, callback) { callback(null, { user: "local-test" }); },
  onData(stream, session, callback) {
    let text = ""; stream.on("data", chunk => { text += chunk.toString(); });
    stream.on("end", () => { messages.push({ recipients: session.envelope.rcptTo.map(item => item.address), text: text.replace(/=\r?\n/g, "").replace(/=3D/g, "=") }); callback(); });
    stream.on("error", callback);
  },
});
const db = new pg.Pool({ connectionString: process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL, max: 2, connectionTimeoutMillis: 15000, query_timeout: 30000,
  ssl: { ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"), rejectUnauthorized: true, checkServerIdentity: (_, cert) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME, cert) } });
function pass(name) { checks.push({ name, status: "passed" }); console.log(`PASS ${name}`); }
async function call(context, path, data, expected = 200) {
  const response = await context.post(path, { data, timeout: 120000 });
  const body = await response.json();
  assert.equal(response.status(), expected, `${path}: status ${response.status()}, ${body.error ?? body.message ?? ""}`);
  return body;
}
async function linkFor(email, subject) {
  for (let attempt = 0; attempt < 30; attempt++) {
    const message = messages.findLast(item => item.recipients.includes(email) && item.text.includes(subject));
    const link = message?.text.match(/http:\/\/localhost:3100\/[^\s<>]+/)?.[0];
    if (link) return link;
    await pause(500);
  }
  throw Error(`Local SMTP did not capture ${subject}`);
}
async function account(label) {
  const email = `${run}-${label}@example.test`;
  // RFC 5737 documentation addresses keep each synthetic client in its own IP rate-limit bucket.
  const testIP = `198.51.100.${clientNumber++}`;
  const context = await request.newContext({ baseURL, timeout: 120000, extraHTTPHeaders: { Origin: baseURL, "x-real-ip": testIP } });
  accounts.push({ email, context });
  await call(context, "/api/auth/sign-up/email", { name: `Test ${label}`, email, password, adultConfirmed: true, termsAccepted: true, phone: "+15550000000", country: "Test", occupation: "Student", experienceLevel: "Beginner", learningGoals: "Learn software engineering", referralCode: "", newsletter: false, role: "admin", callbackURL: "/learn" });
  const row = (await db.query('SELECT id, role, "emailVerified" FROM learning_users WHERE email=$1', [email])).rows[0];
  assert.equal(row.role, "student"); assert.equal(row.emailVerified, false);
  await call(context, "/api/auth/sign-in/email", { email, password }, 403);
  const link = await linkFor(email, "Verify your TekSpyk email");
  const verified = await context.get(link, { maxRedirects: 0 }); assert.equal(verified.status(), 302);
  const session = await (await context.get("/api/auth/get-session")).json();
  assert.equal(session.user.emailVerified, true);
  return { context, email, id: row.id };
}
try {
  await fs.mkdir("test-results", { recursive: true });
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(2526, "127.0.0.1", resolve); });
  const log = await fs.open("test-results/learning-server.log", "w");
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", "3100"], {
    cwd: process.cwd(), windowsHide: true, stdio: ["ignore", log.fd, log.fd],
    env: { ...process.env, BETTER_AUTH_URL: baseURL, LEARNING_REGISTRATION_ENABLED: "true", AUTH_EMAIL_VERIFICATION_ENABLED: "true", SMTP_HOST: "127.0.0.1", SMTP_PORT: "2526", SMTP_USER: "test", SMTP_PASSWORD: password, SMTP_FROM: "TekSpyk Test <test@example.test>", ADMIN_NOTIFICATION_EMAIL: "" },
  });
  for (let i = 0; i < 120; i++) { try { if ((await fetch(`${baseURL}/api/health`, { signal: AbortSignal.timeout(15000) })).ok) break; } catch { /* Startup connection refusal is expected; bounded below. */ } await pause(1000); }
  assert.ok((await fetch(`${baseURL}/api/health`)).ok, "Test app must be healthy");
  pass("Database-backed health endpoint");
  const admin = await request.newContext({ baseURL, timeout: 120000, extraHTTPHeaders: { Origin: baseURL } });
  const login = await admin.post("/api/admin/session", { form: { token: process.env.ADMIN_ACCESS_TOKEN }, maxRedirects: 0 });
  assert.equal(login.status(), 303);
  assert.ok(!login.headers()["set-cookie"].includes(process.env.ADMIN_ACCESS_TOKEN));
  const topicId = `test-${run}`;
  await call(admin, "/api/admin/curriculum", { id: topicId, status: "hidden", tutorNote: "Temporary test note", sortOrder: 7 });
  const cleared = await call(admin, "/api/admin/curriculum", { id: topicId, tutorNote: null });
  assert.equal(cleared.status, "hidden"); assert.equal(cleared.sortOrder, 7); assert.equal(cleared.tutorNote, null);
  await db.query("DELETE FROM curriculum_topics WHERE id=$1", [topicId]);
  pass("Curriculum note clearing preserves status and sort order");
  const alice = await account("alice"); const bob = await account("bob");
  const teacher = await account("teacher"); const other = await account("other-teacher");
  pass("Four real signups, captured verification email, unverified login blocked, role injection rejected");
  await call(admin, "/api/admin/teachers", { email: teacher.email, role: "teacher" });
  await call(admin, "/api/admin/teachers", { email: other.email, role: "teacher" });
  assert.equal(await (await teacher.context.get("/api/auth/get-session")).json(), null);
  await call(teacher.context, "/api/auth/sign-in/email", { email: teacher.email, password });
  await call(other.context, "/api/auth/sign-in/email", { email: other.email, password });
  pass("Admin teacher provisioning and session revocation");
  await call(alice.context, "/api/learning", { action: "create-class", title: "Forbidden class", description: "A learner cannot create this." }, 403);
  const course = await call(teacher.context, "/api/learning", { action: "create-ai-course" });
  const lessons = (await db.query("SELECT l.id, a.id AS assignment_id, a.kind FROM learning_lessons l JOIN learning_assignments a ON a.lesson_id=l.id WHERE l.class_id=$1 ORDER BY l.position", [course.id])).rows;
  assert.equal(lessons.length, 9);
  await call(alice.context, "/api/learning", { action: "enroll", classId: course.id }, 404);
  await call(other.context, "/api/learning", { action: "publish-class", classId: course.id }, 404);
  await call(teacher.context, "/api/learning", { action: "publish-class", classId: course.id });
  pass("Complete course draft, publication gate, and teacher ownership checks");
  await call(bob.context, "/api/learning", { action: "submit", assignmentId: lessons[0].assignment_id, body: "This account has not enrolled in this class.", answers: [] }, 404);
  await call(alice.context, "/api/learning", { action: "enroll", classId: course.id });
  await call(alice.context, "/api/learning", { action: "enroll", classId: course.id });
  assert.equal((await db.query("SELECT count(*)::int AS n FROM learning_enrollments WHERE class_id=$1 AND user_id=$2", [course.id, alice.id])).rows[0].n, 1);
  await call(alice.context, "/api/learning", { action: "submit", assignmentId: lessons[0].assignment_id, body: "A fictional volunteer needs an evidence-backed action list. Missing owners must be labeled as not specified.", answers: [] });
  const submission = (await db.query("SELECT id, version, grade FROM learning_submissions WHERE assignment_id=$1 AND user_id=$2", [lessons[0].assignment_id, alice.id])).rows[0];
  assert.equal(submission.grade, null);
  await call(other.context, "/api/learning", { action: "grade", submissionId: submission.id, version: submission.version, grade: 100, feedback: "Not my class." }, 404);
  await call(alice.context, "/api/learning", { action: "grade", submissionId: submission.id, version: submission.version, grade: 100, feedback: "Cannot grade own work." }, 403);
  await call(teacher.context, "/api/learning", { action: "grade", submissionId: submission.id, version: submission.version, grade: 85, feedback: "Clear user and missing-data behavior. Add measurable acceptance checks." });
  await call(teacher.context, "/api/learning", { action: "grade", submissionId: submission.id, version: submission.version, grade: 90, feedback: "Stale update must fail." }, 409);
  await call(alice.context, "/api/learning", { action: "submit", assignmentId: lessons[0].assignment_id, body: "Attempting to replace a graded response should fail.", answers: [] }, 409);
  pass("Idempotent enrollment, written submission, teacher grading, ownership, and stale-write protection");
  const quiz = lessons.find(item => item.kind === "quiz");
  const quizHTML = await (await alice.context.get(`/learn/${course.slug}/${quiz.id}`)).text();
  assert.ok(!quizHTML.includes("correctIndex"), "Answer key must not reach the learner");
  const scored = await call(alice.context, "/api/learning", { action: "submit", assignmentId: quiz.assignment_id, body: "", answers: [1, 0, 2] });
  assert.equal(scored.score, 100);
  await call(alice.context, "/api/learning", { action: "submit", assignmentId: quiz.assignment_id, body: "", answers: [0, 0, 0] }, 409);
  await call(alice.context, "/api/learning", { action: "progress", lessonId: lessons[0].id, completed: true });
  pass("Hidden answer keys, deterministic quiz score, single scored attempt, and durable lesson completion");
  browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
  const context = await browser.newContext({ storageState: await alice.context.storageState() });
  const page = await context.newPage();
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  await page.goto(`${baseURL}/learn/${course.slug}/${lessons[0].id}`, { timeout: 120000 });
  await page.getByText("Teacher grade: 85/100").waitFor();
  for (const width of [320, 375, 390, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `No horizontal overflow at ${width}px`);
  }
  await page.screenshot({ path: "test-results/learner-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "test-results/learner-mobile.png", fullPage: true });
  assert.deepEqual(errors, []);
  pass("Authenticated grade view, six responsive widths, and no browser runtime errors");
  const denied = await bob.context.get(`/learn/${course.slug}/${lessons[0].id}`);
  assert.ok(!(await denied.text()).includes("Clear user and missing-data behavior"));
  const csrf = await alice.context.post("/api/learning", { headers: { Origin: "https://attacker.example" }, data: { action: "enroll", classId: course.id } }); assert.equal(csrf.status(), 403);
  const oversized = await alice.context.post("/api/learning", { data: { action: "submit", body: "x".repeat(140000) } }); assert.equal(oversized.status(), 413);
  pass("Learner record isolation, cross-origin rejection, and request-size limit");
  await call(alice.context, "/api/auth/request-password-reset", { email: alice.email, redirectTo: "/reset-password" });
  const resetLink = await linkFor(alice.email, "Reset your TekSpyk password");
  const resetRedirect = await alice.context.get(resetLink, { maxRedirects: 0 });
  const token = new URL(resetRedirect.headers().location, baseURL).searchParams.get("token");
  assert.ok(token);
  const newPassword = randomBytes(24).toString("base64url");
  await call(alice.context, "/api/auth/reset-password", { token, newPassword });
  assert.equal(await (await alice.context.get("/api/auth/get-session")).json(), null);
  await call(alice.context, "/api/auth/sign-in/email", { email: alice.email, password: newPassword });
  await call(alice.context, "/api/auth/sign-out", {});
  assert.equal(await (await alice.context.get("/api/auth/get-session")).json(), null);
  pass("Captured reset email, password reset, prior-session revocation, login, and logout");
  const before = (await db.query("SELECT count(*)::int AS n FROM learning_users")).rows[0].n;
  const minorEmail = `${run}-minor@example.test`;
  await call(admin, "/api/auth/sign-up/email", { name: "Under age test", email: minorEmail, password, adultConfirmed: false, termsAccepted: true }, 403);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM learning_users")).rows[0].n, before);
  assert.equal((await db.query("SELECT count(*)::int AS n FROM learning_users WHERE email=$1", [minorEmail])).rows[0].n, 0);
  pass("Minor account creation blocked before persistence");
  const adminCookies = await admin.storageState();
  await admin.post("/api/admin/logout", { maxRedirects: 0 });
  const replay = await request.newContext({ baseURL, storageState: adminCookies });
  assert.equal((await replay.get("/api/admin/export")).status(), 401);
  pass("Admin logout invalidates a replayed cookie");
  await replay.dispose(); await admin.dispose();
} catch (error) {
  const detail = safeMessage(error.stack || error.message);
  checks.push({ name: "Learning integration suite", status: "failed", detail });
  console.error(detail); process.exitCode = 1;
} finally {
  try {
    await db.query("BEGIN");
    try {
      const users = (await db.query("SELECT id FROM learning_users WHERE email LIKE $1 FOR UPDATE", [`${run}-%@example.test`])).rows.map(row => row.id);
      const classes = users.length ? (await db.query("SELECT id FROM learning_classes WHERE instructor_id = ANY($1::text[])", [users])).rows.map(row => row.id) : [];
      const lessons = classes.length ? (await db.query("SELECT id FROM learning_lessons WHERE class_id = ANY($1::uuid[])", [classes])).rows.map(row => row.id) : [];
      const assignments = lessons.length ? (await db.query("SELECT id FROM learning_assignments WHERE lesson_id = ANY($1::uuid[])", [lessons])).rows.map(row => row.id) : [];
      if (users.length || assignments.length) await db.query("DELETE FROM learning_submissions WHERE user_id = ANY($1::text[]) OR graded_by = ANY($1::text[]) OR assignment_id = ANY($2::uuid[])", [users, assignments]);
      if (users.length || lessons.length) await db.query("DELETE FROM learning_progress WHERE user_id = ANY($1::text[]) OR lesson_id = ANY($2::uuid[])", [users, lessons]);
      if (users.length || classes.length) await db.query("DELETE FROM learning_enrollments WHERE user_id = ANY($1::text[]) OR class_id = ANY($2::uuid[])", [users, classes]);
      if (lessons.length) await db.query("DELETE FROM learning_assignments WHERE lesson_id = ANY($1::uuid[])", [lessons]);
      if (classes.length) await db.query("DELETE FROM learning_lessons WHERE class_id = ANY($1::uuid[])", [classes]);
      if (users.length) await db.query("DELETE FROM learning_classes WHERE instructor_id = ANY($1::text[])", [users]);
      if (users.length) await db.query("DELETE FROM learning_users WHERE id = ANY($1::text[])", [users]);
      await db.query("DELETE FROM curriculum_topics WHERE id=$1", [`test-${run}`]);
      await db.query("COMMIT");
      checks.push({ name: "Synthetic fixture cleanup", status: "passed", detail: `${users.length} tagged test users and dependent records removed` });
    } catch (error) { await db.query("ROLLBACK"); throw error; }
  } catch (error) {
    checks.push({ name: "Synthetic fixture cleanup", status: "failed", detail: safeMessage(error.message) });
    console.error(`Fixture cleanup failed: ${safeMessage(error.message)}`); process.exitCode = 1;
  }
  try {
    await browser?.close();
    for (const account of accounts) await account.context.dispose();
    await db.end();
    await new Promise(resolve => server.close(resolve));
    if (app && app.exitCode === null) {
      if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(app.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else app.kill();
    }
  } finally {
    const logPath = "test-results/learning-server.log";
    try {
      const log = await fs.readFile(logPath, "utf8");
      await fs.writeFile(logPath, safeMessage(log).replace(new RegExp(password, "g"), "[REDACTED]"));
    } catch { /* No log is expected before startup. */ }
    await fs.writeFile("test-results/learning-checks.json", JSON.stringify({ generatedAt: new Date().toISOString(), environment: "local app with Railway staging PostgreSQL and local SMTP capture", checks }, null, 2));
  }
}
