import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Registration request received",
  description: "Your TekSpyk registration request was saved.",
  robots: { index: false },
};

const nextSteps = [
  "Your registration request has been saved. Email delivery is not configured, so no confirmation message will be sent.",
  "This request does not create a learner account or provide access to classes.",
  "For questions, contact the TekSpyk team at hello@tekspyk.com.",
];

export default function ThankYouPage() {
  return (
    <main className="hero-wash flex min-h-screen flex-col items-center justify-center bg-bg px-5 py-16 text-ink">
      <div className="w-full max-w-md text-center">
        <span className="inline-flex rounded-full bg-blue/10 p-4 text-blue">
          <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
        </span>
        <h1 className="mt-6 text-4xl tracking-[-0.03em] sm:text-5xl">
          Request received
        </h1>
        <p className="mt-4 text-lg leading-8 text-ink-soft">
          Your TekSpyk registration request has been saved. Here is what to expect.
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
