import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { currentLearningUser } from "@/lib/learning-session";
import { teachingClasses } from "@/lib/learning-store";
import { LearningShell } from "@/components/learning-shell";
import { CreateClassForm, LearningActionButton } from "@/components/learning-controls";

export const metadata: Metadata = { title: "Teaching", robots: { index: false, follow: false } };
export default async function TeachPage() {
  const user = await currentLearningUser(); if (!user) redirect("/sign-in");
  if (user.role !== "teacher" && user.role !== "admin") notFound();
  const classes = await teachingClasses(user);
  return <LearningShell user={user} active="teach"><div className="class-intro"><h1>Teach through making.</h1><p>Build a class, give learners something worth doing, and help them improve.</p></div>
    <section className="learning-panel mb-8"><h2>Start with AI foundations</h2><p className="mb-5">Create a private draft with nine lessons, two automatic knowledge checks, and seven written assignments. Review the content before publishing it for enrollment.</p><LearningActionButton input={{ action: "create-ai-course" }}>Create AI foundations draft</LearningActionButton></section>
    <div className="teaching-layout"><section><h2>Your classes</h2>{classes.length === 0 ? <div className="learning-empty"><h3>Create your first class</h3><p>Start with a focused outcome. Add a lesson and assignment, then publish when you are ready.</p></div> : <div className="space-y-4 mt-5">{classes.map((course) => <Link className="teaching-class-card" href={`/teach/${course.id}`} key={course.id}><span className="learning-badge">{course.status}</span><h3>{course.title}</h3><p>{course.learners} learners · {course.pending} submissions to review</p><span className="text-blue font-medium">Open class →</span></Link>)}</div>}</section><section className="learning-panel"><h2>Create a class</h2><CreateClassForm /></section></div>
  </LearningShell>;
}
