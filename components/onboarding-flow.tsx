"use client";

import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { waitlistSchema } from "@/lib/waitlist-schema";
import { trackEvent } from "@/lib/analytics";
import { LogoMark } from "@/components/logo";

type StepId = "build" | "experience" | "proof" | "occupation" | "goal" | "contact" | "consent";

const STEPS: StepId[] = ["build", "experience", "proof", "occupation", "goal", "contact", "consent"];

interface QuizOption {
  emoji: string;
  label: string;
  description?: string;
}

const buildOptions: QuizOption[] = [
  { emoji: "🖥️", label: "3-month Computer Training Program", description: "Computer fundamentals, digital literacy, Office, internet, and productivity." },
  { emoji: "💻", label: "6-month Comprehensive Computer Training", description: "Professional computer skills across fundamentals, Office, design, coding, and cybersecurity." },
  { emoji: "🌐", label: "AI-powered web apps", description: "Full products people use in the browser, built with modern stacks." },
  { emoji: "📱", label: "Mobile apps", description: "iOS and Android products built with cross-platform tools." },
  { emoji: "🤖", label: "AI agents and automation", description: "Agents and workflows that do real work on their own." },
  { emoji: "🚀", label: "SaaS products", description: "Complete software businesses, from database to deployment." },
];

const experienceOptions: QuizOption[] = [
  { emoji: "🌱", label: "Beginner", description: "I'm starting from zero. No coding experience yet." },
  { emoji: "🛠️", label: "Intermediate", description: "I've built a few things and know some fundamentals." },
  { emoji: "⚡", label: "Advanced", description: "I already ship software and want to master AI workflows." },
];

const occupationOptions: QuizOption[] = [
  { emoji: "🎓", label: "Student" },
  { emoji: "💼", label: "Working professional" },
  { emoji: "🧭", label: "Founder" },
  { emoji: "🔄", label: "Career switcher" },
];

const goalOptions: QuizOption[] = [
  { emoji: "🏆", label: "Land a job in tech" },
  { emoji: "💡", label: "Launch my own product" },
  { emoji: "⚙️", label: "Automate my work with AI" },
  { emoji: "📈", label: "Level up my engineering skills" },
];

interface ContactFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
}

const contactFieldOrder: Array<{ key: keyof ContactFields; label: string; type: string; autoComplete: string; placeholder: string }> = [
  { key: "firstName", label: "First name", type: "text", autoComplete: "given-name", placeholder: "Ada" },
  { key: "lastName", label: "Last name", type: "text", autoComplete: "family-name", placeholder: "Lovelace" },
  { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "you@example.com" },
  { key: "phone", label: "Phone", type: "tel", autoComplete: "tel", placeholder: "+1 555 000 0000" },
  { key: "country", label: "Country", type: "text", autoComplete: "country-name", placeholder: "United States" },
];

const contactSchema = waitlistSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  country: true,
});

function OptionButton({
  option,
  selected,
  onSelect,
}: {
  option: QuizOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`w-full rounded-[14px] border px-4 py-[18px] text-left transition-colors ${
        selected
          ? "border-blue bg-blue/10"
          : "border-transparent bg-surface hover:border-line hover:bg-surface-deep"
      }`}
    >
      <span className="flex items-start gap-3">
        <span className="text-xl leading-6" aria-hidden="true">{option.emoji}</span>
        <span>
          <span className="block font-semibold text-ink">{option.label}</span>
          {option.description ? (
            <span className="mt-0.5 block text-sm leading-6 text-ink-soft">{option.description}</span>
          ) : null}
        </span>
      </span>
    </button>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [buildChoice, setBuildChoice] = useState<string | null>(null);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);
  const [occupation, setOccupation] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactFields>({
    firstName: "",
    lastName: "",
    email: searchParams.get("email") ?? "",
    phone: "",
    country: "",
  });
  const [contactErrors, setContactErrors] = useState<Partial<Record<keyof ContactFields, string>>>({});
  const [referralCode, setReferralCode] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [adultConfirmed, setAdultConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [consentError, setConsentError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const step = STEPS[stepIndex];

  const goForward = () => {
    setDirection(1);
    setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  };

  const goBack = () => {
    if (stepIndex === 0) {
      router.push("/");
      return;
    }
    setDirection(-1);
    setStepIndex((index) => index - 1);
  };

  const selectAndAdvance = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    trackEvent("onboarding_step_completed", { step, value });
    goForward();
  };

  const handleContactContinue = () => {
    const parsed = contactSchema.safeParse(contact);
    if (!parsed.success) {
      const errors: Partial<Record<keyof ContactFields, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof ContactFields;
        if (!errors[key]) errors[key] = issue.message;
      }
      setContactErrors(errors);
      return;
    }
    setContactErrors({});
    trackEvent("onboarding_step_completed", { step: "contact" });
    goForward();
  };

  const handleSubmit = async () => {
    setConsentError(null);
    setSubmitError(null);

    if (!adultConfirmed) {
      setConsentError("You must confirm that you are 18 or older to sign up.");
      return;
    }

    if (!termsAccepted) {
      setConsentError("You must accept the terms and privacy policy to join.");
      return;
    }

    if (honeypot.trim().length > 0) {
      router.push("/thank-you");
      return;
    }

    const payload = {
      ...contact,
      occupation: occupation ?? "",
      experienceLevel: experienceLevel ?? "",
      learningGoals: `I am interested in ${buildChoice ?? "learning technology"}. My main goal is to ${(goal ?? "level up my engineering skills").toLowerCase()}.`,
      referralCode: referralCode.trim(),
      newsletter,
      adultConfirmed,
      termsAccepted,
    };

    const parsed = waitlistSchema.safeParse(payload);
    if (!parsed.success) {
      setSubmitError("Something is missing. Please go back and complete every step.");
      return;
    }

    setIsSubmitting(true);
    try {
      trackEvent("registration_submit_started");
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error || "Your signup could not be completed. Please try again.");
      }
      trackEvent("registration_submit_succeeded");
      router.push("/sign-up");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Please try again in a moment.");
      trackEvent("registration_submit_failed");
      setIsSubmitting(false);
    }
  };

  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-5">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <Link href="/" className="inline-flex items-center">
            <LogoMark imageClassName="h-6 w-auto" priority />
          </Link>
          <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-soft">
            2-minute signup
          </span>
        </div>
        <div className="h-1 w-full bg-surface" role="progressbar" aria-label="Signup progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full bg-blue transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-16 pt-10 sm:pt-14">
        <div
          key={step}
          className={`flex flex-1 flex-col ${direction === 1 ? "step-in-forward" : "step-in-back"}`}
        >
          {step === "build" ? (
            <section aria-labelledby="q-build">
              <h1 id="q-build" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                What would you like to learn first?
              </h1>
              <p className="mt-2 text-ink-soft">Choose a Computer Training program or an AI software-building path.</p>
              <div className="mt-8 flex flex-col gap-3">
                {buildOptions.map((option) => (
                  <OptionButton
                    key={option.label}
                    option={option}
                    selected={buildChoice === option.label}
                    onSelect={() => selectAndAdvance(setBuildChoice)(option.label)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "experience" ? (
            <section aria-labelledby="q-experience">
              <h1 id="q-experience" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                How much coding experience do you have?
              </h1>
              <p className="mt-2 text-ink-soft">Be honest. The curriculum meets you where you are.</p>
              <div className="mt-8 flex flex-col gap-3">
                {experienceOptions.map((option) => (
                  <OptionButton
                    key={option.label}
                    option={option}
                    selected={experienceLevel === option.label}
                    onSelect={() => selectAndAdvance(setExperienceLevel)(option.label)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "proof" ? (
            <section aria-labelledby="proof-heading" className="flex flex-1 flex-col justify-center py-8 text-center">
              <h1 id="proof-heading" className="text-4xl tracking-[-0.03em] text-blue sm:text-5xl">
                16 disciplines
              </h1>
              <p className="mx-auto mt-4 max-w-sm text-lg leading-8 text-ink-soft">
                from AI fundamentals to deployment and monitoring, taught through real products you ship yourself.
              </p>
              <p className="mt-8 font-semibold">Share your learning interests with the TekSpyk team.</p>
              <button
                type="button"
                onClick={goForward}
                className="glow-border mx-auto mt-10 inline-flex w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </section>
          ) : null}

          {step === "occupation" ? (
            <section aria-labelledby="q-occupation">
              <h1 id="q-occupation" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                What best describes you today?
              </h1>
              <div className="mt-8 flex flex-col gap-3">
                {occupationOptions.map((option) => (
                  <OptionButton
                    key={option.label}
                    option={option}
                    selected={occupation === option.label}
                    onSelect={() => selectAndAdvance(setOccupation)(option.label)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "goal" ? (
            <section aria-labelledby="q-goal">
              <h1 id="q-goal" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                What&apos;s your #1 goal with TekSpyk?
              </h1>
              <div className="mt-8 flex flex-col gap-3">
                {goalOptions.map((option) => (
                  <OptionButton
                    key={option.label}
                    option={option}
                    selected={goal === option.label}
                    onSelect={() => selectAndAdvance(setGoal)(option.label)}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {step === "contact" ? (
            <section aria-labelledby="q-contact">
              <h1 id="q-contact" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                TekSpyk registration request
              </h1>
              <p className="mt-2 text-ink-soft">Add your details to submit a registration request. This form does not create a learner account. Email confirmations and product updates are not available yet.</p>
              <form
                className="mt-8 flex flex-col gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleContactContinue();
                }}
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  {contactFieldOrder.slice(0, 2).map((field) => (
                    <div key={field.key}>
                      <label htmlFor={field.key} className="mb-1.5 block text-sm font-semibold">
                        {field.label}
                      </label>
                      <input
                        id={field.key}
                        type={field.type}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        value={contact[field.key]}
                        onChange={(event) =>
                          setContact((current) => ({ ...current, [field.key]: event.target.value }))
                        }
                        aria-invalid={Boolean(contactErrors[field.key])}
                        className="h-12 w-full rounded-[14px] border border-line bg-surface px-4 text-ink placeholder:text-ink-faint focus:border-blue focus:bg-white focus:outline-none"
                      />
                      {contactErrors[field.key] ? (
                        <p role="alert" className="mt-1.5 text-sm font-medium text-pink">
                          {contactErrors[field.key]}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
                {contactFieldOrder.slice(2).map((field) => (
                  <div key={field.key}>
                    <label htmlFor={field.key} className="mb-1.5 block text-sm font-semibold">
                      {field.label}
                    </label>
                    <input
                      id={field.key}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      placeholder={field.placeholder}
                      value={contact[field.key]}
                      onChange={(event) =>
                        setContact((current) => ({ ...current, [field.key]: event.target.value }))
                      }
                      aria-invalid={Boolean(contactErrors[field.key])}
                      className="h-12 w-full rounded-[14px] border border-line bg-surface px-4 text-ink placeholder:text-ink-faint focus:border-blue focus:bg-white focus:outline-none"
                    />
                    {contactErrors[field.key] ? (
                      <p role="alert" className="mt-1.5 text-sm font-medium text-pink">
                        {contactErrors[field.key]}
                      </p>
                    ) : null}
                  </div>
                ))}
                <div className="absolute left-[-9999px] top-auto" aria-hidden="true">
                  <label htmlFor="company-website">Company website</label>
                  <input
                    id="company-website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="glow-border mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </section>
          ) : null}

          {step === "consent" ? (
            <section aria-labelledby="q-consent">
              <h1 id="q-consent" className="text-[26px] leading-tight tracking-[-0.025em] sm:text-3xl">
                Last step. Lock in your spot.
              </h1>
              <p className="mt-2 text-ink-soft">Add a referral code if a friend sent you, then confirm.</p>
              <div className="mt-8 flex flex-col gap-5">
                <div>
                  <label htmlFor="referralCode" className="mb-1.5 block text-sm font-semibold">
                    Referral code <span className="font-normal text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="referralCode"
                    type="text"
                    value={referralCode}
                    onChange={(event) => setReferralCode(event.target.value)}
                    placeholder="FRIEND2026"
                    autoComplete="off"
                    className="h-12 w-full rounded-[14px] border border-line bg-surface px-4 uppercase tracking-wide text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-faint focus:border-blue focus:bg-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-3 rounded-[14px] bg-surface p-4">
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      checked={adultConfirmed}
                      onChange={(event) => {
                        setAdultConfirmed(event.target.checked);
                        if (event.target.checked) setConsentError(null);
                      }}
                      className="mt-1 h-4 w-4 accent-[oklch(55%_0.22_262)]"
                    />
                    <span className="text-ink-soft">I confirm that I am 18 or older. Under-18 applicants cannot join until TekSpyk has an approved guardian-consent process.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      checked={newsletter}
                      onChange={(event) => setNewsletter(event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[oklch(55%_0.22_262)]"
                    />
                    <span className="text-ink-soft">Send me product updates and launch announcements.</span>
                  </label>
                  <label className="flex cursor-pointer items-start gap-3 text-sm leading-6">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(event) => {
                        setTermsAccepted(event.target.checked);
                        if (event.target.checked) setConsentError(null);
                      }}
                      className="mt-1 h-4 w-4 accent-[oklch(55%_0.22_262)]"
                    />
                    <span className="text-ink-soft">I agree to the <Link href="/terms" className="font-semibold text-blue underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">terms</Link> and <Link href="/privacy" className="font-semibold text-blue underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue">privacy policy</Link>.</span>
                  </label>
                  {consentError ? (
                    <p role="alert" className="text-sm font-medium text-pink">{consentError}</p>
                  ) : null}
                </div>
                {submitError ? (
                  <p role="alert" className="rounded-[14px] bg-pink/10 px-4 py-3 text-sm font-medium text-pink">
                    {submitError}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="glow-border inline-flex items-center justify-center gap-2 rounded-xl bg-blue px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-deep disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Joining us
                    </>
                  ) : (
                    <>
                      Submit request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}
