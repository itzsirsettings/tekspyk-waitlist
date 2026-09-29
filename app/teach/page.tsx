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
    <section className="learning-panel mb-8"><h2>Start from a curriculum</h2><p className="mb-5">Create a complete, private draft. Review every topic, edit lessons, add illustrative images or tutorial videos, then publish when it is ready.</p><div className="curriculum-template-grid"><article><span className="learning-badge">AI & software</span><h3>AI engineering foundations</h3><p>9 lessons from problem framing through testing, deployment, and monitoring.</p><LearningActionButton input={{ action: "create-ai-course" }}>Create AI course draft</LearningActionButton></article><article><span className="learning-badge">Digital foundations</span><h3>Computer skills · intensive</h3><p>12 weekly lessons covering digital literacy, office tools, design, and web basics.</p><LearningActionButton input={{ action: "create-computer-training-3m" }}>Create 3-month draft</LearningActionButton></article><article><span className="learning-badge">Digital skills</span><h3>Computer skills · comprehensive</h3><p>24 weekly lessons from computer fundamentals to modern AI use and a practical capstone.</p><LearningActionButton input={{ action: "create-computer-training-6m" }}>Create 6-month draft</LearningActionButton></article></div><Link className="learning-back mt-5" href="/curriculum">Explore the full topic map →</Link></section>
    <div className="teaching-layout"><section><h2>Your classes</h2>{classes.length === 0 ? <div className="learning-empty"><h3>Create your first class</h3><p>Start with a focused outcome. Add a lesson and assignment, then publish when you are ready.</p></div> : <div className="space-y-4 mt-5">{classes.map((course) => <Link className="teaching-class-card" href={`/teach/${course.id}`} key={course.id}><span className="learning-badge">{course.status}</span><h3>{course.title}</h3><p>{course.learners} learners · {course.pending} submissions to review</p><span className="text-blue font-medium">Open class →</span></Link>)}</div>}</section><section className="learning-panel"><h2>Create a class</h2><CreateClassForm /></section></div>
  </LearningShell>;
}
