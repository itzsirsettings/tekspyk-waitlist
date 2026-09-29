import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { currentLearningUser } from "@/lib/learning-session";
import { learningClass } from "@/lib/learning-store";
import { HttpError } from "@/lib/http";
import { LearningShell } from "@/components/learning-shell";
import { LearningActionButton } from "@/components/learning-controls";

export default async function ClassPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await currentLearningUser(); if (!user) redirect("/sign-in");
  const { slug } = await params;
  const data = await learningClass(slug, user).catch((error) => { if (error instanceof HttpError && error.status === 404) notFound(); throw error; });
  const { course, lessons } = data;
  return <LearningShell user={user}>
    <Link className="learning-back" href="/learn"><ArrowLeft size={16} /> My learning</Link>
    <div className="class-intro"><span className="learning-badge">AI engineering · Self-paced</span><h1>{course.title}</h1><p>{course.description}</p><p className="text-sm text-ink-soft">With {course.instructor} · {lessons.length} lessons</p>{!course.enrolled && <LearningActionButton input={{ action: "enroll", classId: course.id }}>Join this class</LearningActionButton>}</div>
    <section aria-labelledby="lessons-heading"><div className="section-heading"><h2 id="lessons-heading">Your path through the class</h2></div><ol className="lesson-list">{lessons.map((lesson, i) => <li key={lesson.id}><span className="lesson-number">{lesson.completed ? <CheckCircle2 size={23} aria-label="Completed" /> : String(i + 1).padStart(2, "0")}</span><div><h3>{lesson.title}</h3><p>{lesson.grade != null ? `Assignment grade: ${lesson.grade}/100` : "Lesson and practical assignment"}</p></div>{course.enrolled ? <Link aria-label={`Open ${lesson.title}`} href={`/learn/${slug}/${lesson.id}`}><ArrowRight aria-hidden="true" /></Link> : <span className="text-sm text-ink-soft">Join to begin</span>}</li>)}</ol></section>
  </LearningShell>;
}
