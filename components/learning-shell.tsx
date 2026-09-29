import Link from "next/link";
import { BookOpen, GraduationCap, ArrowUpRight } from "lucide-react";
import type { LearningUser } from "@/lib/learning-session";
import { SignOutButton } from "@/components/learning-controls";

export function LearningShell({ user, active = "learn", children }: { user: LearningUser; active?: "learn" | "teach"; children: React.ReactNode }) {
  return <div className="learning-shell">
    <a href="#learning-content" className="skip-link">Skip to content</a>
    <header className="learning-header">
      <Link href="/" className="learning-wordmark">TekSpyk<span aria-hidden="true">.</span></Link>
      <nav aria-label="Learning navigation">
        <Link href="/learn" aria-current={active === "learn" ? "page" : undefined}><BookOpen size={18} aria-hidden="true" /> My learning</Link>
        {user.role !== "student" && <Link href="/teach" aria-current={active === "teach" ? "page" : undefined}><GraduationCap size={19} aria-hidden="true" /> Teaching</Link>}
        <Link href="/curriculum">Explore curriculum <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </nav>
      <div className="learning-account"><span>{user.name}</span><SignOutButton /></div>
    </header>
    <main id="learning-content" className="learning-content">{children}</main>
    <footer className="learning-footer"><span>Learn it. Build it. Understand it.</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><a href="mailto:hello@tekspyk.com">Get help</a></div></footer>
  </div>;
}
