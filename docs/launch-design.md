# TekSpyk launch design

## Current product and launch boundary

The existing Next.js 16 and React 19 application has been extended from a waitlist and curriculum preview into a learning workflow with verified-email accounts, open self-enrollment in published classes, authored lessons, assignments, progress, deterministic quiz scoring, teacher grading, and an audit trail. The preview's check marks remain browser-local. TekSpyk now has Railway staging and production environments with PostgreSQL and web services; the production web service is live. Production learner registration remains disabled while verification/reset email delivery is unavailable. See operations.md for the current release boundary.

The first live learning workflow will use the existing AI engineering curriculum. A learner creates and verifies an account, openly enrolls in a class, studies an authored lesson, submits an assignment, and sees progress and a grade. Objective questions can be scored deterministically. A teacher reviews free-text submissions and controls the final grade. Existing waitlist records stay separate and are never converted to accounts automatically.

## Threat model and boundaries

| Asset | Entry point and boundary | Principal risk | Required control |
| --- | --- | --- | --- |
| Learner identity and sessions | Browser to auth API | Account takeover, enumeration, session theft | Maintained auth library, verified email, secure cookies, revocation, persistent rate limits |
| Submissions and grades | Learner and teacher APIs to PostgreSQL | IDOR, grade tampering, injection | Server-side role and enrollment checks, parameterized queries, constraints, audit trail |
| Minors' information | Registration and learning records | Collection without lawful basis or consent | Age-appropriate intake, data minimization, no public profiles, jurisdiction review before activation |
| Waitlist leads | Public form and admin CSV | Spam, disclosure, CSV formula injection | Persistent abuse limits, admin session, no-store responses, escaped export |
| Admin functions | Admin page and API | Credential theft, brute force, CSRF | No plaintext secret cookie, rate limiting, origin checking, secure session storage |
| Infrastructure secrets | Environment and logs | Exposure in client or diagnostic route | Remove diagnostic routes, redact errors, secret manager, log hygiene |

## Data flow and deployment

Next.js route handlers and server components perform authorization before reading or writing PostgreSQL. Auth tables use Better Auth-compatible migrations; learning tables use additive SQL migrations. The browser receives only records owned by the learner or assigned to the teacher. Quiz answer keys are removed from learner responses. SMTP carries verification and reset links; delivery is required for account activation. Railway is the selected deployment target. Production is live, but registration remains disabled until SMTP credentials and a verified sender are configured and tested. The learner app changes must not bypass verified identity or role checks.

## Failure, recovery, and release

- Database failure returns a safe service error. It must never be represented as a successful write or an empty authoritative gradebook.
- SMTP failure prevents account activation and is visible in operational logs without logging tokens or message bodies.
- Additive migrations run against a restored or staging database first. Take a production backup, record the schema version, then apply them in order. Forward repair is preferred when rows have already been written under a new schema.
- A failed application release rolls back the application deployment. A failed database migration is repaired from the pre-migration backup or with reviewed forward SQL.
- Health checks, auth, ownership, enrollment, submission, grading, email, mobile UI, and live domain checks are release gates.

## Decisions

**Decision:** Keep Next.js and PostgreSQL. **Alternatives:** Replace the backend with Convex or move the site to another host. **Rationale:** Existing persistence and deployment files already use PostgreSQL, and migration would add risk without a demonstrated need. **Revisit when:** A product requirement cannot be met economically or reliably on the current stack.

**Decision:** Written assignments require teacher grading; objective quizzes receive an immediate fixed-key score with teacher review available. **Alternatives:** AI grading of free-text work. **Rationale:** An automated model cannot be treated as the authority for a consequential learner record without evaluation and oversight. Deterministic objective scoring can be immediate. **Revisit when:** An evaluated rubric, appeals path, and human review process are in place.

**Decision:** Treat global access for minors as a launch blocker until the operator defines jurisdiction-specific age, consent, retention, and guardian processes. **Alternatives:** Claim one global consent flow is sufficient. **Rationale:** Regulatory requirements differ and the current repository has no verified guardian process. **Revisit when:** Legal and product owners approve a documented set of launch jurisdictions and controls.
