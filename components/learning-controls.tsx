"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import type { LearningAction, QuizQuestion } from "@/lib/learning-schema";
import type { LessonDetail, Submission } from "@/lib/learning-store";

async function changeLearning(input: LearningAction) {
  const response = await fetch("/api/learning", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error ?? "Unable to save. Please try again.");
  return result as { success: true; id?: string; slug?: string; score?: number | null };
}

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div><button className="learning-text-button" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try { const result = await authClient.signOut(); if (result.error) throw new Error("Sign out failed."); router.replace("/sign-in"); router.refresh(); }
    catch { setError("Unable to sign out. Try again."); setBusy(false); }
  }}>{busy ? "Signing out…" : "Sign out"}</button>{error && <p role="alert">{error}</p>}</div>;
}

export function LearningActionButton({ input, children, secondary = false }: { input: LearningAction; children: React.ReactNode; secondary?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div><button className={secondary ? "learning-secondary" : "learning-primary"} disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try { const result = await changeLearning(input); if (input.action === "create-ai-course" && result.id) router.push(`/teach/${result.id}`); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save."); }
    finally { setBusy(false); }
  }}>{busy ? "Saving…" : children}</button>{error && <p className="form-error" role="alert">{error}</p>}</div>;
}

export function AssessmentForm({ lesson }: { lesson: LessonDetail }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const graded = lesson.submission?.grade != null;
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true); setError(""); setSaved(false);
    try {
      await changeLearning({ action: "submit", assignmentId: lesson.assignment_id, body: String(form.get("body") ?? ""), answers: lesson.questions.map((_, i) => Number(form.get(`answer-${i}`))) });
      setSaved(true); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to submit."); }
    finally { setBusy(false); }
  }
  return <section className="assessment-panel" aria-labelledby="assignment-heading">
    <div className="section-heading"><h2 id="assignment-heading">Put it into practice</h2><span className="learning-badge">{lesson.kind === "quiz" ? "Knowledge check" : "Written assignment"}</span></div>
    <p className="whitespace-pre-wrap">{lesson.prompt}</p>
    {lesson.kind === "quiz" && !graded && <p className="field-hint">One scored attempt. Review your answers before submitting. Your teacher can review the result.</p>}
    <form onSubmit={submit} className="learning-form">
      {lesson.kind === "written" ? <label>Your response<textarea name="body" rows={9} required minLength={20} maxLength={20000} defaultValue={lesson.submission?.body ?? ""} disabled={graded} placeholder="Explain your thinking and include the evidence that supports it." /></label> :
        lesson.questions.map((question, i) => <fieldset key={i} disabled={graded} className="quiz-question"><legend>{i + 1}. {question.prompt}</legend>{question.options.map((option, j) => <label className="quiz-option" key={j}><input type="radio" name={`answer-${i}`} value={j} required defaultChecked={lesson.submission?.answers[i] === j} />{option}</label>)}</fieldset>)}
      {!graded && <button className="learning-primary" disabled={busy}>{busy ? "Submitting…" : lesson.submission ? "Update submission" : "Submit assignment"}</button>}
    </form>
    {error && <p className="form-error" role="alert">{error}</p>}
    {saved && <p className="form-notice" role="status">Submission saved.</p>}
    {lesson.submission && <div className="grade-result"><h3>{graded ? `${lesson.submission.grading_source === "teacher" ? "Teacher grade" : "Automatic score"}: ${lesson.submission.grade}/100` : "Submitted for review"}</h3><p>{graded ? lesson.submission.feedback || "Your knowledge check has been scored. Your teacher can review this result." : "Your teacher will review your work. You can update it until a grade is recorded."}</p></div>}
  </section>;
}

export function CreateClassForm() {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <form className="learning-form" onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; const form = new FormData(event.currentTarget); setBusy(true); setError("");
    try { const result = await changeLearning({ action: "create-class", title: String(form.get("title")), description: String(form.get("description")) }); router.push(`/teach/${result.id}`); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to create class."); setBusy(false); }
  }}><label>Class title<input name="title" required minLength={3} maxLength={140} placeholder="AI Engineering: From idea to prototype" /></label><label>What will learners be able to do?<textarea name="description" required minLength={10} maxLength={2000} rows={3} /></label><button className="learning-primary" disabled={busy}>{busy ? "Creating…" : "Create class draft"}</button>{error && <p className="form-error" role="alert">{error}</p>}</form>;
}

const blankQuestion = (): QuizQuestion => ({ prompt: "", options: ["", "", ""], correctIndex: 0 });
export function CreateLessonForm({ classId }: { classId: string }) {
  const router = useRouter(); const [kind, setKind] = useState<"written" | "quiz">("written");
  const [questions, setQuestions] = useState<QuizQuestion[]>([blankQuestion()]);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  function updateQuestion(index: number, patch: Partial<QuizQuestion>) { setQuestions((prev) => prev.map((q, i) => i === index ? { ...q, ...patch } : q)); }
  return <form className="learning-form" onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; const element = event.currentTarget; const form = new FormData(element); setBusy(true); setError(""); setNotice("");
    try {
      await changeLearning({ action: "create-lesson", classId, title: String(form.get("title")), content: String(form.get("content")), prompt: String(form.get("prompt")), kind, questions: kind === "quiz" ? questions : [] });
      element.reset(); setQuestions([blankQuestion()]); setNotice("Lesson and assignment saved."); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save lesson."); }
    finally { setBusy(false); }
  }}>
    <label>Lesson title<input name="title" required minLength={3} maxLength={140} /></label>
    <label>Lesson content<textarea name="content" required minLength={50} maxLength={50000} rows={12} placeholder="Teach the concept, work through an example, and explain how to apply it. Separate paragraphs with a blank line." /></label>
    <label>Assignment type<select value={kind} onChange={(event) => setKind(event.target.value as "written" | "quiz")}><option value="written">Written work, graded by a teacher</option><option value="quiz">Multiple choice, scored automatically</option></select></label>
    <label>Assignment instructions<textarea name="prompt" required minLength={10} maxLength={5000} rows={3} /></label>
    {kind === "quiz" && <div className="space-y-5">{questions.map((question, i) => <fieldset className="quiz-question" key={i}><legend>Question {i + 1}</legend>
      <label>Question<input required minLength={5} maxLength={1000} value={question.prompt} onChange={(e) => updateQuestion(i, { prompt: e.target.value })} /></label>
      {question.options.map((option, j) => <label key={j}>Answer {j + 1}<input required maxLength={500} value={option} onChange={(e) => updateQuestion(i, { options: question.options.map((old, k) => k === j ? e.target.value : old) })} /></label>)}
      <label>Correct answer<select value={question.correctIndex} onChange={(e) => updateQuestion(i, { correctIndex: Number(e.target.value) })}>{question.options.map((_, j) => <option value={j} key={j}>Answer {j + 1}</option>)}</select></label>
      {questions.length > 1 && <button type="button" className="learning-text-button" onClick={() => setQuestions((old) => old.filter((_, k) => k !== i))}>Remove question {i + 1}</button>}
    </fieldset>)}<button type="button" className="learning-secondary" disabled={questions.length >= 20} onClick={() => setQuestions((old) => [...old, blankQuestion()])}>Add question</button></div>}
    <button className="learning-primary" disabled={busy}>{busy ? "Saving…" : "Save lesson and assignment"}</button>
    {error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-notice" role="status">{notice}</p>}
  </form>;
}

export function GradeForm({ submission }: { submission: Submission }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [saved, setSaved] = useState(false);
  return <form className="learning-form" onSubmit={async (event) => {
    event.preventDefault(); if (busy) return; const form = new FormData(event.currentTarget); setBusy(true); setError(""); setSaved(false);
    try { await changeLearning({ action: "grade", submissionId: submission.id, version: submission.version, grade: Number(form.get("grade")), feedback: String(form.get("feedback")) }); setSaved(true); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to save grade."); }
    finally { setBusy(false); }
  }}><label>Grade out of 100<input type="number" name="grade" required min={0} max={100} step={1} defaultValue={submission.grade ?? ""} /></label><label>Feedback for the learner<textarea name="feedback" required minLength={5} maxLength={5000} rows={3} defaultValue={submission.feedback} /></label><button className="learning-primary" disabled={busy}>{busy ? "Saving…" : "Record teacher grade"}</button>{error && <p className="form-error" role="alert">{error}</p>}{saved && <p className="form-notice" role="status">Grade recorded.</p>}</form>;
}

export function EditLessonForm({ lesson }: { lesson: { id: string; title: string; content: string; prompt: string } }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [saved, setSaved] = useState(false);
  return <form className="learning-form" onSubmit={async event => {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError(""); setSaved(false);
    try { await changeLearning({ action: "update-lesson", lessonId: lesson.id, title: String(form.get("title")), content: String(form.get("content")), prompt: String(form.get("prompt")) }); setSaved(true); router.refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save."); } finally { setBusy(false); }
  }}><label>Lesson title<input name="title" required minLength={3} maxLength={140} defaultValue={lesson.title} /></label><label>Lesson content<textarea name="content" rows={14} required minLength={50} maxLength={50000} defaultValue={lesson.content} /></label><label>Assignment instructions<textarea name="prompt" rows={4} required minLength={10} maxLength={5000} defaultValue={lesson.prompt} /></label><button className="learning-primary" disabled={busy}>{busy ? "Saving…" : "Save draft changes"}</button>{error && <p role="alert" className="form-error">{error}</p>}{saved && <p role="status">Draft saved.</p>}</form>;
}
