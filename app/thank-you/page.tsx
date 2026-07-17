import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're on the list",
  description: "Your place on the TekSpyk waitlist is reserved.",
  robots: { index: false },
};

const nextSteps = [
  "Watch your inbox for a welcome note and launch updates.",
  "You get first access when the founding cohort opens.",
  "Share TekSpyk with a friend who learns by building.",
];

export default function ThankYouPage() {
  return (
    <main className="hero-wash flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-16 text-ink">
      <div className="w-full max-w-md text-center">
        <span className="inline-flex rounded-full bg-blue/10 p-4 text-blue">
          <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl tracking-[-0.03em] sm:text-5xl">
          You&apos;re on the list!
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">
          Your place on the TekSpyk waitlist is reserved. Here is what happens next.
        </p>
        <ul className="mt-8 flex flex-col gap-3 text-left">
          {nextSteps.map((item, index) => (
            <li key={item} className="flex items-baseline gap-3 rounded-[14px] bg-surface px-4 py-[18px]">
              <span className="text-sm font-bold tabular-nums text-blue">{index + 1}</span>
              <span className="leading-6 text-ink-soft">{item}</span>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-col items-center gap-4">
          <Link
            href="/"
            className="inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
          >
            Back to TekSpyk
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="mailto:hello@tekspyk.com" className="text-sm font-semibold text-ink-soft transition-colors hover:text-ink">
            Questions? Write to hello@tekspyk.com
          </a>
        </div>
      </div>
    </main>
  );
}
