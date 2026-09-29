# TekSpyk

TekSpyk is a self-paced AI foundations learning portal. Learners can enroll in published classes, complete written or automatically scored quizzes, track lesson progress, and review teacher feedback. Teachers can draft, revise, and publish course material and grade written submissions. The first course, **AI Foundations**, is authored in `lib/ai-foundations-course.ts`.

## Current launch state

The Railway environment created for this work is **staging**. Learner registration is deliberately disabled there (`LEARNING_REGISTRATION_ENABLED=false`). The public landing page and learning preview are available, but accounts must not be activated until email delivery and the operator-owned global guardian-consent and privacy process are approved and deployed. The privacy and terms pages identify those pending decisions; they are not a claim of legal approval.

## Stack and boundaries

- Next.js App Router, React, TypeScript and PostgreSQL on Railway.
- Better Auth stores verified-email accounts and revocable database sessions. The application role is separate from the database migration owner.
- Learning APIs enforce verified sessions, role and resource ownership on the server. PostgreSQL transactions preserve enrollment, grading and audit invariants.
- Quiz answer keys are removed from learner responses. Teacher grading is version-checked; published course content is immutable.
- Email is delivered through configured SMTP with TLS. There is no fake-success production fallback or durable email outbox.

## Local setup

Use Node.js 24 and npm. Copy `.env.example` to `.env.local`, configure PostgreSQL with a verified CA and expected server name, and set separate `MIGRATION_DATABASE_URL` and least-privilege `DATABASE_URL` values. Generate independent random values of at least 32 characters for `BETTER_AUTH_SECRET` and `ADMIN_ACCESS_TOKEN`. Set `BETTER_AUTH_URL` to the local HTTPS origin in any production-like environment. Do not commit secrets.

Apply schema changes with `npm run db:migrate`; the migration command uses the owner URL, advisory locking, and a checksum ledger. Then run `npm ci`, `npm run lint`, `npm test`, and `npm run build`. The staging-only browser workflow is `npm run test:learning`; it creates synthetic accounts and requires the explicitly gated staging database plus local test SMTP. Never point it at production.

## Deployment

`railway.toml` records the intended build/start/health configuration. Railway service settings are also configured directly because the first source upload did not apply the file's build command. The staging build gate is `npm ci --include=dev && npm run lint && npm test && npm run build`; the service starts with `npm start` and checks `/api/health`.

Use `node scripts/package-release.mjs` to create an allowlisted source bundle and SHA-256 manifest for the Railway CLI source upload. The release excludes `.env*`, private keys, dependencies and local test artifacts. Inspect the manifest/hash and exact Railway deployment logs before reporting a release. Database backup/restore procedures and operational limitations are in `docs/operations.md`; architecture and security decisions are in `docs/launch-design.md` and `docs/decision-records.md`.

## Operational prerequisites before opening registration

1. Configure and prove production SMTP verification/reset delivery.
2. Publish an operator-approved guardian consent and jurisdiction/age handling process before under-18 activation.
3. Define data retention, deletion, backup schedule and restore objectives, incident contact, monitoring, and production ownership.
4. Create a production environment with restricted access, reviewed migrations and a verified release/rollback procedure.

These are launch gates, not features supplied by the staging prototype.
