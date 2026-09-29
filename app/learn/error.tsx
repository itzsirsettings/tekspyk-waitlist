"use client";
import Link from "next/link";
export default function LearningError({ reset }: { reset: () => void }) {
  return <main className="auth-page"><section className="auth-card"><h1>Learning is temporarily unavailable</h1><p>Your saved work is kept. Please try loading this page again.</p><button className="learning-primary mt-6" onClick={reset}>Try again</button><Link href="/" className="learning-back mt-6">Back to TekSpyk</Link></section></main>;
}
