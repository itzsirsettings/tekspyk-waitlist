"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/logo";

type Mode = "sign-in" | "sign-up" | "forgot-password" | "reset-password" | "verify-email";
const titles: Record<Mode, string> = {
  "sign-in": "Welcome back", "sign-up": "Start learning with TekSpyk", "forgot-password": "Reset your password",
  "reset-password": "Choose a new password", "verify-email": "Verify your email",
};

export function AuthForm({ mode, registrationEnabled = true, emailActionsEnabled = false }: { mode: Mode; registrationEnabled?: boolean; emailActionsEnabled?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const isSignup = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    try {
      if (isSignup) {
        if (form.get("adultConfirmed") !== "on" || form.get("terms") !== "on") throw new Error("Confirm the age requirement and accept the terms to continue.");
        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: String(form.get("name") ?? "").trim(), email, password, adultConfirmed: true, termsAccepted: true, callbackURL: "/learn" }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message ?? data.error ?? "Account creation is unavailable. Please try again.");
        }
        setNotice("Check your inbox for a verification link. If this address already has an account, sign in or reset your password.");
      } else if (mode === "sign-in") {
        const result = await authClient.signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message ?? "Unable to sign in.");
        router.replace("/learn"); router.refresh();
      } else if (mode === "forgot-password") {
        const result = await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
        if (result.error) throw new Error(result.error.message ?? "Unable to request a reset.");
        setNotice("If an account exists for this email, a password reset link will be sent. Check your inbox and spam folder.");
      } else if (mode === "verify-email") {
        const result = await authClient.sendVerificationEmail({ email, callbackURL: "/learn" });
        if (result.error) throw new Error(result.error.message ?? "Unable to request verification.");
        setNotice("If verification is needed, a new link will be sent to your inbox.");
      } else {
        const token = params.get("token");
        if (!token) throw new Error("This reset link is invalid. Request a new one.");
        const result = await authClient.resetPassword({ newPassword: password, token });
        if (result.error) throw new Error(result.error.message ?? "This reset link is invalid or expired.");
        setNotice("Your password has been changed. You can now sign in.");
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to connect. Please try again."); }
    finally { setBusy(false); }
  }

  if (isSignup) return <main className="signup-page">
    <header className="signup-header">
      <Link href="/" aria-label="TekSpyk home"><LogoMark /></Link>
      <p>Already have a learning profile? <Link href="/sign-in">Sign in</Link></p>
    </header>
    <div className="signup-grid">
      <section className="signup-story" aria-labelledby="signup-story-heading">
        <p className="signup-eyebrow"><span aria-hidden="true">✦</span> LEARN BY SHIPPING</p>
        <h1 id="signup-story-heading">Turn curiosity into things that work.</h1>
        <p className="signup-story-copy">One TekSpyk profile connects your classes, builds, and progress in a focused workspace made for software learners.</p>
        <ol className="signup-steps">
          <li><span>01</span><div><strong>Learn the foundations</strong><p>Break big ideas into practical steps.</p></div></li>
          <li><span>02</span><div><strong>Build real software</strong><p>Turn each lesson into working code.</p></div></li>
          <li><span>03</span><div><strong>See your progress</strong><p>Keep your work and feedback together.</p></div></li>
        </ol>
        <div className="signup-stamp"><span aria-hidden="true">TS</span><p>Made for the next generation of builders.</p></div>
      </section>

      <section className="signup-card" aria-labelledby="signup-heading">
        <p className="signup-card-kicker">YOUR LEARNER PROFILE</p>
        <h2 id="signup-heading">Create your account</h2>
        <p className="signup-card-intro">Set up your personal TekSpyk learning space.</p>
        {!registrationEnabled && <p className="signup-paused" role="status">Account creation is temporarily paused while secure verification email is configured. This is a learning account, not a mailing list.</p>}
        <form onSubmit={submit} className="learning-form">
          <label>Display name<input name="name" autoComplete="name" required minLength={2} maxLength={100} disabled={!registrationEnabled || busy} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} disabled={!registrationEnabled || busy} /></label>
          <label>Password
            <input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} aria-describedby="password-hint" disabled={!registrationEnabled || busy} />
            <span id="password-hint" className="field-hint">Use at least 12 characters. A memorable phrase works well.</span>
          </label>
          <label className="checkbox-label"><input type="checkbox" name="adultConfirmed" required disabled={!registrationEnabled || busy} /> I confirm that I am 18 or older.</label>
          <p className="field-hint signup-age-note">Accounts for learners under 18 remain closed until a guardian and regional privacy process is approved.</p>
          <label className="checkbox-label"><input type="checkbox" name="terms" required disabled={!registrationEnabled || busy} /><span>I agree to the <Link href="/terms">terms</Link> and have read the <Link href="/privacy">privacy notice</Link>.</span></label>
          <button className="learning-primary signup-submit" disabled={busy || !registrationEnabled}>{busy ? "Setting up your profile…" : registrationEnabled ? "Create learner account" : "Account creation paused"}</button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <p className="signup-privacy-note">Your learning profile is private. Class work and grades are visible only to you, your class teacher, and authorized administrators.</p>
        <nav className="auth-links" aria-label="Account support">
          <Link href="/sign-in">I already have an account</Link>
        </nav>
      </section>
    </div>
    <footer className="signup-footer"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><span>© 2026 TekSpyk</span></footer>
  </main>;

  if (["forgot-password", "verify-email"].includes(mode) && !emailActionsEnabled) return <main className="auth-page">
    <Link href="/" className="learning-wordmark">TekSpyk<span aria-hidden="true">.</span></Link>
    <section className="auth-card" aria-labelledby="auth-heading">
      <h1 id="auth-heading">Email support is temporarily unavailable</h1>
      <p className="form-notice" role="status">Email verification and password recovery have been paused. Use the email address you registered with and keep your password safe. For account help, contact hello@tekspyk.com.</p>
      <nav className="auth-links" aria-label="Account help"><Link href="/sign-in">Back to sign in</Link></nav>
    </section>
  </main>;

  return <main className="auth-page">
    <Link href="/" className="learning-wordmark">TekSpyk<span aria-hidden="true">.</span></Link>
    <section className="auth-card" aria-labelledby="auth-heading">
      <p className="text-sm text-ink-soft">Your next chapter starts here.</p>
      <h1 id="auth-heading">{titles[mode]}</h1>
      <form onSubmit={submit} className="learning-form">
          {mode !== "reset-password" && <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>}
          {["sign-up", "sign-in", "reset-password"].includes(mode) && <label>Password
            <input name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required minLength={mode === "sign-in" ? 1 : 12} maxLength={128} aria-describedby={mode === "sign-in" ? undefined : "password-hint"} />
            {mode !== "sign-in" && <span id="password-hint" className="field-hint">Use at least 12 characters. A memorable phrase works well.</span>}
          </label>}
          <button className="learning-primary" disabled={busy}>{busy ? "Please wait…" : ({ "sign-in": "Sign in", "sign-up": "Create account", "forgot-password": "Send reset link", "reset-password": "Save new password", "verify-email": "Send verification link" }[mode])}</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
      {notice && <p className="form-notice" role="status">{notice}</p>}
      <nav className="auth-links" aria-label="Account help">
        {mode !== "sign-in" && <Link href="/sign-in">Sign in</Link>}
        {mode === "sign-in" && <><Link href="/onboarding">Create an account</Link>{emailActionsEnabled && <><Link href="/forgot-password">Forgot password?</Link><Link href="/verify-email">Resend verification</Link></>}</>}
        {mode === "reset-password" && <Link href="/forgot-password">Request a new reset link</Link>}
      </nav>
    </section>
  </main>;
}
