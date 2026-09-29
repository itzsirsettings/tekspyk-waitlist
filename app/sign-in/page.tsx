import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "sign in", robots: { index: false, follow: false } };
export default function Page() {
  return <Suspense fallback={<main className="auth-page"><p role="status">Loading account form…</p></main>}><AuthForm mode="sign-in" emailActionsEnabled={process.env.AUTH_EMAIL_VERIFICATION_ENABLED === "true"} /></Suspense>;
}
