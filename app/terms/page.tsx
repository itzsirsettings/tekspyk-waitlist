import Link from "next/link";

export const metadata = { title: "Registration terms" };

export default function Terms() {
  return (
    <main className="learning-main lesson-reading">
      <Link href="/">TekSpyk home</Link>
      <h1>Registration terms</h1>
      <p>
        Version 29 September 2026. Submitting the TekSpyk registration form sends a request for the team
        to review your learning interests. It does not create an account, guarantee admission, enroll you
        in a class, or provide access to learning materials. You must be at least 18 to submit the form.
      </p>

      <h2>Your information and product updates</h2>
      <p>
        Provide accurate contact and learning-interest information. Choosing product updates is optional.
        Email verification and password-recovery email are temporarily unavailable. Use an email address
        you control and keep your password safe; TekSpyk cannot currently send a recovery link.
      </p>

      <h2>Service availability</h2>
      <p>
        TekSpyk may be unavailable during maintenance or recovery. Registration creates a learner account;
        access to published classes is subject to the class enrollment settings. Accounts are currently
        restricted to people who confirm they are at least 18. Under-18 access remains closed until a
        guardian-consent process is approved and implemented.
      </p>

      <h2>Operator and privacy contact</h2>
      <p>
        TekSpyk is operated by MPT Tecnologies Africa Limited. Contact <a href="mailto:hello@tekspyk.com">
        hello@tekspyk.com</a> with questions about registration information. A retention period and
        request-handling deadline have not yet been defined. Read the <Link href="/privacy">privacy
        information</Link> for details.
      </p>
    </main>
  );
}
