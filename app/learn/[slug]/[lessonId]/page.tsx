import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { currentLearningUser } from "@/lib/learning-session";
import { learningLesson } from "@/lib/learning-store";
import { HttpError } from "@/lib/http";
import { LearningShell } from "@/components/learning-shell";
import { AssessmentForm, LearningActionButton } from "@/components/learning-controls";
import { LessonMedia } from "@/components/lesson-media";
import { LessonContent } from "@/components/lesson-content";

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const user = await currentLearningUser(); if (!user) redirect("/sign-in");
  const { slug, lessonId } = await params;
  if (!z.string().uuid().safeParse(lessonId).success) notFound();
  const lesson = await learningLesson(lessonId, user).catch((error) => { if (error instanceof HttpError && error.status === 404) notFound(); throw error; });
  if (lesson.class_slug !== slug) notFound();
  return <LearningShell user={user}><div className="lesson-reading">
    <Link className="learning-back" href={`/learn/${slug}`}><ArrowLeft size={16} /> {lesson.class_title}</Link>
    <article className="lesson-article"><p className="lesson-topic-label">{lesson.topic}{lesson.subtopic ? ` / ${lesson.subtopic}` : ""}</p><h1>{lesson.title}</h1><LessonMedia media={lesson.media} topic={lesson.topic} /><LessonContent content={lesson.content} /></article>
    <div className="lesson-completion"><p>{lesson.completed ? "This lesson is saved as complete." : "Finished the lesson? Save your progress."}</p><LearningActionButton secondary input={{ action: "progress", lessonId, completed: !lesson.completed }}>{lesson.completed ? "Mark as incomplete" : "Mark lesson complete"}</LearningActionButton></div>
    <AssessmentForm lesson={lesson} />
  </div></LearningShell>;
}
