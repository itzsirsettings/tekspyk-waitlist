import Link from "next/link";

export const metadata = { title: "Privacy information" };

export default function Privacy() {
  return (
    <main className="learning-main lesson-reading">
      <Link href="/">TekSpyk home</Link>
      <h1>Privacy information</h1>
      <p>
        Updated 29 September 2026. TekSpyk is operated by MPT Tecnologies Africa Limited. The public
        registration form creates a learner account and stores the learning profile in Railway
        PostgreSQL. Learners must confirm that they are at least 18. Under-18 applicants cannot register
        while the guardian-consent process is undefined.
      </p>

      <h2>Information collected</h2>
      <p>
        The registration form collects your name, email address, phone number, country, occupation,
        experience level, learning goals, optional referral code, and whether you opted into product
        updates. The account and learning profile are stored in TekSpyk&apos;s Railway database. Authorized
        administrators may review account details when operating the service. The product-updates choice
        is optional and is not currently used to send email.
      </p>

      <h2>Email and service providers</h2>
      <p>
        Email verification and password-recovery email are temporarily unavailable. The email address is
        not verified, so use an address you control and keep your password safe. The application and
        database are hosted on Railway.
      </p>

      <h2>Retention and privacy requests</h2>
      <p>
        Account, learning activity, submission, feedback, and grade records are retained while needed to
        provide the service and until a deletion process is available; formal retention and backup-copy
        expiry periods are still being defined. To ask a privacy question or request action on your
        information, contact <a href="mailto:hello@tekspyk.com"> hello@tekspyk.com</a>.
      </p>

      <p><Link href="/terms">Registration terms</Link></p>
    </main>
  );
}
