import Link from "next/link";

export const metadata = { title: "Privacy information" };

export default function Privacy() {
  return (
    <main className="learning-main lesson-reading">
      <Link href="/">TekSpyk home</Link>
      <h1>Privacy information</h1>
      <p>
        Updated 29 September 2026. TekSpyk is operated by MPT Tecnologies Africa Limited. The public form
        collects registration requests; it does not create a learner account, enroll you in a class, or
        provide access to lessons. Applicants must confirm that they are at least 18. Under-18 applicants
        cannot use the form while the guardian-consent process is undefined.
      </p>

      <h2>Information collected</h2>
      <p>
        The registration form collects your name, email address, phone number, country, occupation,
        experience level, learning goals, optional referral code, and whether you opted into product
        updates. The request is stored in TekSpyk&apos;s Railway production database and may be reviewed by
        authorized TekSpyk administrators. The product-updates choice is optional.
      </p>

      <h2>Email and service providers</h2>
      <p>
        TekSpyk does not currently send registration confirmations or product-update emails. Your request
        can be saved and confirmed on screen without an email. The application and database are hosted on
        Railway.
      </p>

      <h2>Retention and privacy requests</h2>
      <p>
        A retention period, request-handling deadline, and backup-copy expiry for registration requests
        have not been defined. To ask a privacy question or request action on your information, contact
        <a href="mailto:hello@tekspyk.com"> hello@tekspyk.com</a>. Do not submit information you do not
        want included in a registration request. TekSpyk account registration is closed; learner accounts,
        lesson activity, submissions, feedback, and grades are not collected through this public form.
      </p>

      <p><Link href="/terms">Registration terms</Link></p>
    </main>
  );
}
