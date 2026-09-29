import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { z } from "zod";
import { currentLearningUser } from "@/lib/learning-session";
import { teachingClass } from "@/lib/learning-store";
import { HttpError } from "@/lib/http";
import { LearningShell } from "@/components/learning-shell";
import { CreateLessonForm, EditLessonForm, GradeForm, LearningActionButton } from "@/components/learning-controls";
import { LessonMedia } from "@/components/lesson-media";
import { LessonContent } from "@/components/lesson-content";

export default async function TeacherClassPage({ params }: { params: Promise<{ classId: string }> }) {
  const user = await currentLearningUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "admin") notFound();
  const { classId } = await params;
  if (!z.string().uuid().safeParse(classId).success) notFound();
  const { course, lessons, submissions, roster } = await teachingClass(classId, user).catch((error) => {
    if (error instanceof HttpError && error.status === 404) notFound();
    throw error;
  });

  return <LearningShell user={user} active="teach">
    <Link className="learning-back" href="/teach">← Your classes</Link>
    <div className="class-intro">
      <span className="learning-badge">{course.subject} · {course.level} · {course.status}</span>
      <h1>{course.title}</h1><p>{course.description}</p>
      {course.status === "draft" ? <LearningActionButton input={{ action: "publish-class", classId }}>Publish class for open enrollment</LearningActionButton> : <Link className="learning-secondary" href={`/learn/${course.slug}`}>View class page</Link>}
    </div>

    <section className="learning-panel">
      <div className="section-heading"><div><h2>Lessons</h2><p className="learning-section-caption">Add a new topic at any time. Published lessons keep their original assignments.</p></div><span className="learning-count">{lessons.length}</span></div>
      {lessons.length === 0 ? <p className="text-ink-soft">No lessons yet. Add your first lesson below.</p> : <ol className="teacher-lesson-list">{lessons.map((lesson) => <li key={lesson.id}>
        <details className="learning-details">
          <summary><span className="lesson-topic-label">{lesson.topic}{lesson.subtopic ? ` · ${lesson.subtopic}` : ""}</span>{lesson.title}</summary>
          <p className="learning-badge">{lesson.published ? (lesson.kind === "quiz" ? "Published knowledge check" : "Published written assignment") : "Draft lesson · learners cannot see it yet"}</p>
          <LessonMedia media={lesson.media} topic={lesson.topic} />
          {lesson.published ? <><LessonContent content={lesson.content} /><h3>Assignment</h3><p className="submitted-work">{lesson.prompt}</p></> : <>
            <EditLessonForm lesson={lesson} classId={classId} />
            {course.status === "published" && <LearningActionButton input={{ action: "publish-lesson", lessonId: lesson.id }}>Publish this lesson for learners</LearningActionButton>}
          </>}
          {lesson.questions.map((question, index) => <div className="quiz-question" key={index}><h3>{question.prompt}</h3><ol>{question.options.map((option, optionIndex) => <li key={optionIndex}>{option}{optionIndex === question.correctIndex ? " (correct)" : ""}</li>)}</ol></div>)}
        </details>
      </li>)}</ol>}
      <details className="learning-details"><summary>Add a lesson, image, or video tutorial</summary><CreateLessonForm classId={classId} /></details>
    </section>

    <div className="teaching-layout mt-8">
      <section aria-labelledby="submissions-heading"><h2 id="submissions-heading">Review submissions</h2>
        {submissions.length === 0 ? <div className="learning-empty"><p>Submitted assignments will appear here.</p></div> : submissions.map((submission) => <details className="submission-card" key={`${submission.id}-${submission.version}`}>
          <summary><div><strong>{submission.learner}</strong><span>{submission.lesson}</span></div><span className="learning-badge">{submission.grade == null ? "Needs review" : `${submission.grade}/100`}</span></summary>
          <div className="submission-body"><h3>Assignment</h3><p>{submission.prompt}</p><h3 className="mt-5">Learner response</h3><div className="submitted-work">{submission.kind === "written" ? submission.body : <><p>Automatic score: {submission.auto_score}/100</p>{submission.questions.map((question, index) => <div key={index}><strong>{question.prompt}</strong><p>Selected: {question.options[submission.answers[index]]}</p><p>Answer key: {question.options[question.correctIndex]}</p></div>)}</>}</div><GradeForm submission={submission} /></div>
        </details>)}
      </section>
      <section className="learning-panel"><h2>Class roster</h2><p className="field-hint">Latest 100 enrollments</p>{roster.length === 0 ? <p className="text-ink-soft mt-4">No learners have joined yet.</p> : <ul className="roster-list">{roster.map((learner, index) => <li key={index}><strong>{learner.name}</strong><span>{learner.completed}/{lessons.filter((lesson) => lesson.published).length} lessons complete</span></li>)}</ul>}</section>
    </div>
  </LearningShell>;
}
