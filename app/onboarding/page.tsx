import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = {
  title: "Create your TekSpyk learner account",
  description: "Choose your learning path and create your TekSpyk account to start learning.",
  robots: { index: false },
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
