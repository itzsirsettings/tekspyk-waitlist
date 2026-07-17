import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Create Your TekSpyk Profile",
  description:
    "Answer a few quick questions and reserve your place on the TekSpyk waitlist. Two minutes, no commitment.",
  robots: { index: false },
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
