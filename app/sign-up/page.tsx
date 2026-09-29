import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create your TekSpyk learner account", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function Page() {
  const registrationEnabled = process.env.LEARNING_REGISTRATION_ENABLED === "true";
  return (
    <Suspense fallback={<main className="auth-page"><p role="status">Loading account setup…</p></main>}>
      <AuthForm mode="sign-up" registrationEnabled={registrationEnabled} />
    </Suspense>
  );
}
