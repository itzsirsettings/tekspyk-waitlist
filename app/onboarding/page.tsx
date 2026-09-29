import type { Metadata } from "next";
import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding-flow";

export const metadata: Metadata = {
  title: "TekSpyk Registration Request",
  description:
    "Share your learning interests and submit a TekSpyk registration request. This form does not create a learner account.",
  robots: { index: false },
};

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" aria-hidden="true" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
