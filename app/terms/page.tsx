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
        Provide accurate contact and learning-interest information. Choosing product updates is optional
        and is saved with your request, but TekSpyk does not currently send registration confirmations or
        product-update emails.
      </p>

      <h2>Service availability</h2>
      <p>
        TekSpyk may be unavailable during maintenance or recovery. A saved registration request does not
        grant access to classes. Learner account registration is closed, and separate learner-account
        terms will be needed before it opens.
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
