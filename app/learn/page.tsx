import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, ArrowUpRight, BookOpen, CheckCircle2, Compass, Play } from "lucide-react";
import { currentLearningUser } from "@/lib/learning-session";
import { learningCatalog, type ClassSummary } from "@/lib/learning-store";
import { LearningShell } from "@/components/learning-shell";

export const metadata: Metadata = { title: "My learning", robots: { index: false, follow: false } };

function ClassCard({ course, index, enrolled }: { course: ClassSummary; index: number; enrolled: boolean }) {
  const nextHref = course.next_lesson_id
    ? `/learn/${course.slug}/${course.next_lesson_id}`
    : `/learn/${course.slug}`;

  return (
    <article className="class-card">
      <div className="class-card-top">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="learning-badge">{enrolled ? "In your classes" : "Open enrollment"}</span>
      </div>
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <div className="class-meta">
        <span>{course.lesson_count} {course.lesson_count === 1 ? "lesson" : "lessons"}</span>
        <span>With {course.instructor}</span>
      </div>
      {enrolled ? (
        <div className="class-progress">
          <progress aria-label={`${course.title}: ${course.completed_count} of ${course.lesson_count} lessons marked complete`} value={course.completed_count} max={course.lesson_count || 1} />
          <span>{course.completed_count} of {course.lesson_count} lessons marked complete</span>
          {course.next_lesson_title ? <p className="class-next-lesson">Next up: {course.next_lesson_title}</p> : (
            <p className="class-next-lesson">{course.lesson_count ? "All lessons marked complete" : "Lessons are being prepared"}</p>
          )}
        </div>
      ) : null}
      <Link className="learning-card-link" href={enrolled ? nextHref : `/learn/${course.slug}`}>
        {enrolled ? (course.next_lesson_id ? "Continue learning" : "Review class") : "View class"}
        {enrolled && course.next_lesson_id ? <Play size={17} aria-hidden="true" /> : <ArrowUpRight size={20} aria-hidden="true" />}
      </Link>
    </article>
  );
}

function EmptyState({ title, children, href, action }: { title: string; children: React.ReactNode; href: string; action: string }) {
  return (
    <div className="learning-empty">
      <BookOpen size={32} aria-hidden="true" />
      <h3>{title}</h3>
      <p>{children}</p>
      <Link href={href} className="learning-secondary">{action}<ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
  );
}

export default async function LearnPage() {
  const user = await currentLearningUser();
  if (!user) redirect("/sign-in");

  const classes = await learningCatalog(user.id);
  const enrolled = classes.filter((course) => course.enrolled);
  const discover = classes.filter((course) => !course.enrolled);
  const completed = enrolled.reduce((sum, course) => sum + course.completed_count, 0);
  const lessonCount = enrolled.reduce((sum, course) => sum + course.lesson_count, 0);
  const nextCourse = enrolled.find((course) => course.next_lesson_id);

  return (
    <LearningShell user={user}>
      <section className="learning-home-hero" aria-labelledby="learning-home-title">
        <div className="learning-home-copy">
          <p className="text-ink-soft">Welcome back, {user.name.split(" ")[0]}</p>
          <h1 id="learning-home-title">{nextCourse ? "Keep your momentum." : "Make room for your next idea."}</h1>
          <p>{nextCourse ? "Your next lesson is ready when you are." : "Choose a class, learn by doing, and build work you can explain."}</p>
          {nextCourse?.next_lesson_id ? (
            <Link className="learning-primary" href={`/learn/${nextCourse.slug}/${nextCourse.next_lesson_id}`}>
              Continue {nextCourse.title}<Play size={16} aria-hidden="true" />
            </Link>
          ) : null}
        </div>
        <div className="learning-totals" aria-label="Your learning progress">
          <div><BookOpen aria-hidden="true" /><strong>{enrolled.length}</strong><span>{enrolled.length === 1 ? "Class joined" : "Classes joined"}</span></div>
          <div><CheckCircle2 aria-hidden="true" /><strong>{completed}<span className="learning-total-denominator">/{lessonCount}</span></strong><span>Lessons marked complete</span></div>
        </div>
      </section>

      <section className="learning-section" aria-labelledby="my-classes-heading">
        <div className="section-heading">
          <div><h2 id="my-classes-heading">Continue learning</h2><p className="learning-section-caption">Your enrolled classes and progress.</p></div>
          <span className="learning-count">{enrolled.length} {enrolled.length === 1 ? "class" : "classes"}</span>
        </div>
        {enrolled.length > 0 ? (
          <div className="class-grid">{enrolled.map((course, index) => <ClassCard key={course.id} course={course} index={index} enrolled />)}</div>
        ) : (
          <EmptyState title="Your learning starts with a class" href="#explore-classes" action="Explore classes">
            Join a published class to keep your lessons, assignments, and progress together here.
          </EmptyState>
        )}
      </section>

      <section id="explore-classes" className="learning-section" aria-labelledby="explore-classes-heading">
        <div className="section-heading">
          <div><h2 id="explore-classes-heading">Explore classes</h2><p className="learning-section-caption">Join any published class at your own pace.</p></div>
          <Compass size={20} className="learning-section-icon" aria-hidden="true" />
        </div>
        {discover.length > 0 ? (
          <div className="class-grid">{discover.map((course, index) => <ClassCard key={course.id} course={course} index={index} enrolled={false} />)}</div>
        ) : (
          <EmptyState title="No new classes are open yet" href="/#curriculum" action="Preview the curriculum">
            Published classes will show up here when they are ready to join. You can still explore the learning paths we are building.
          </EmptyState>
        )}
      </section>
    </LearningShell>
  );
}
