# TekSpyk operations

## Environments and release boundary

The Railway project is `tekspyk` (`fd24329b-f268-4336-81ac-9c5184196701`) with production (`81d04468-2616-4914-8f3d-e31e2fbbb57c`) and staging (`02c9fbf1-f3c6-4663-b36d-752e7854a59a`) environments. Both have `Postgres` and `tekspyk-web` services. The production application is served at `https://tekspyk-web-production.up.railway.app`; staging is `https://tekspyk-web-staging.up.railway.app`. Verify the exact Railway deployment and `/api/health` before describing a release as live.

The project has a live Railway-generated production hostname and a separate staging environment. The operator has accepted operational accountability for learner data and identified the intended legal operator as **MPT Tecnologies Africa Limited**. Do not describe the staging hostname as production.

Learner registration uses the existing multi-step `/onboarding` form to create a Better Auth learner account directly in Railway PostgreSQL. Registration is controlled by `LEARNING_REGISTRATION_ENABLED`. The current launch mode keeps `AUTH_EMAIL_VERIFICATION_ENABLED=false` because transactional email has not been configured; accounts can sign in immediately, while verification and password reset are unavailable. The form tells learners to use an email address they control and keep their password safe. Turn email verification back on only after SMTP delivery is configured and verified. Accounts for minors are blocked by the server regardless of registration configuration. Global minor access remains outside the verified launch boundary until the guardian and jurisdiction process is implemented and approved.

The public learner-registration funnel is the existing seven-step questionnaire at `/onboarding`; `/` routes registration calls to that flow. It creates a student account with the submitted learning preferences and consent, then signs the learner into `/learn`. `/sign-up` redirects to `/onboarding` so there is one registration path. The legacy `/api/waitlist` endpoint and historical records remain available for prior intake data; the public registration form no longer writes to it. Newsletter consent remains opt-in. The waitlist-specific retention period and confirmed privacy contact remain open requirements for historical records.

The current directory is not a Git checkout. A remote repository and protected delivery pipeline still need to be attached before routine source-controlled releases. Preserve a source archive and release hash for an upload-based deployment. Never include `.env*`, `.railway-secrets`, local test results, or dependencies in a source upload.

## Configuration

See `.env.example`. Production startup requires a database URL, an admin secret of at least 32 characters, an independent Better Auth secret of at least 32 characters, and an HTTPS Better Auth URL. Registration additionally requires SMTP configuration. Secrets belong in Railway service variables, not in source or browser code.

Use the `tekspyk_app` database role for the web process. It has table-level read/write access to application tables, read-only migration history, and append/read access to audit records. It has no schema creation, role administration, or database creation permission. The migration owner connection is reserved for maintenance. Reapply reviewed grants after adding new tables or columns. `scripts/provision-app-role.mjs` is a guarded bootstrap for the new staging database and saves its generated password only in ignored local configuration.

The application uses verified database TLS with the database root CA and expected server name. Never set `rejectUnauthorized: false`. Public TCP access is for local staging validation; deployed services use Railway private networking. A CA rotation requires replacing the trusted CA and checking the server name before restarting the app.

The current Railway TOML remains supported by the installed CLI, which reports deprecation after 1 December 2026. Migrate it to Railway Infrastructure as Code before that date and test the generated configuration separately.

## Database migrations and recovery

Run `npm run db:migrate` using the owner URL in `MIGRATION_DATABASE_URL`. The runner holds a PostgreSQL advisory lock, records SHA-256 checksums, and applies each file in a transaction. Never change a migration already recorded in `schema_migrations`; add a new forward migration. A repeated run must report every migration already applied.

Before a production schema change, take a backup, record its timestamp, and verify that it can be restored to a separate empty database. The staging schema was restored to `tekspyk_restore_check`; the check found all six migration records. This verifies the tested snapshot, not production recovery objectives. The temporary dump inside the database container is not a durable off-platform backup.

**Staging recovery status (2026-09-29):** Railway PITR is enabled on the staging Postgres service. The live status probe reports a completed base backup and a healthy WAL archiver. Scheduled daily, weekly, and monthly volume snapshots are not configured: Railway rejected the schedule update with `OAUTH_INSUFFICIENT_GRANT`. The Railway account owner must refresh the Railway CLI/integration authorization with the required grant and rerun the schedule command. This is staging evidence only; it does not protect production data.

Before learner accounts and coursework are opened to the public, verify production volume snapshots and PITR, define and document recovery objectives, and establish an encrypted off-platform logical backup with restricted access. Test restoration periodically. Do not promise an RPO or RTO until measured. Verify actual retention and backup status in the Railway service's Backups view.

The current operator is accountable for learner-data requests and retention decisions. The operator has approved keeping inactive accounts until deletion is requested; do not automatically purge accounts for inactivity. The request fulfillment deadline and handling/retention of coursework, grades, audit records, and backup copies are not yet specified. Do not schedule automatic learner-record deletion or enable registration until those rules and the privacy contact are confirmed. Account deletion is currently a manual code gap: there is no self-service deletion workflow. Build and verify a deletion procedure that covers owned coursework, grades, audit records, and backup expiry after the policy is approved.

For a bad application release, restore the last verified deployment and repeat health and user-journey checks. The retired waitlist tables remain isolated for historical records. Do not drop learning tables to roll back an application. If data was written under a new schema, prefer a reviewed forward repair. Confirm compatibility before reverting application code.

## Access and teaching workflow

An adult creates an account, verifies their email, and signs in. Roles cannot be supplied at registration. An operator signs in at `/admin` with the private admin credential, enters the verified account’s email, and grants teacher access. The account’s sessions are revoked, so it must sign in again. Role changes produce an audit row. The shared operator credential is bootstrap administration; replace it with named administrator accounts and MFA before a multi-operator rollout.

Teachers and administrators use `/teach` to create classes or start from AI foundations or the 3- and 6-month computer-training curricula. A draft is invisible to self-enrollment. The 3-month template creates 12 weekly lessons; the 6-month template creates 24. Both include topic explanations and practical assignments derived from `lib/computer-training-data.ts`. Review lesson content, assignment prompts, and quiz answer keys before publishing. Published lessons remain immutable so existing submissions retain their original assignment. A teacher can add new draft lessons to an already-published class and publish each once reviewed.

The initial public class is **AI foundations: from problem to responsible prototype**, authored in `lib/ai-foundations-course.ts`. Publish that authored nine-lesson edition to an empty environment with `npm run db:seed:ai-foundations`, using the intended Railway service variables. The command accepts only `DEPLOYMENT_STAGE=staging` or `production`, uses verified database TLS, takes an advisory lock, writes the class and its assignments atomically, records publication in `learning_audit`, and refuses to overwrite an existing class. Its non-login curriculum author is `TekSpyk Learning Team` (`course-team@example.test`). Later course edits still go through a teacher-reviewed draft and a new class version.

Learners openly enroll in published classes, mark lesson completion, and submit text or multiple-choice work. Quiz scores are deterministic and use one scored attempt. Written work can be revised until a teacher grades it. Teachers can review and revise scores with feedback; version checks reject stale grading writes. A progress check mark does not imply an assessment pass. Lesson media supports teacher/admin uploads of JPEG, PNG, or WebP images up to 12 MiB and MP4 or WebM videos up to 64 MiB, with required accessible descriptions/captions. In production, files are stored under `RAILWAY_VOLUME_MOUNT_PATH`; local development may set `MEDIA_STORAGE_DIR`. The media route enforces sign-in plus course enrollment or class ownership, checks file signatures, uses random storage keys, and supports byte-range requests for video. Only one Railway web replica should mount this disk volume. Monitor volume capacity, test backups, and account for the volume in the existing production recovery plan. The first workflow still has no learner file submissions, live classroom sessions, payments, certificates, or AI judge for written work.

`/curriculum` is a public curriculum canvas for AI Engineering and the 3- and 6-month computer-training tracks. It is built from the canonical curriculum datasets, supports search, explains listed topics, and generates practice subtopics. The risograph atlas is a bundled optimized WebP asset. Admins may also create classes for other subjects through `/teach`, then add ordered topic/subtopic lessons with text, images, and tutorial video.

## Monitoring and incident response

`GET /api/health` checks database connectivity and the required schema version, returning only `ok` or `unavailable`. Railway uses this for deployment readiness. Pair it with a synthetic check of sign-in, enrollment, submission, and grading; health alone does not prove these flows.

The web service health check is configured, but there is no production environment, alert route, or configured project webhook. Native resource monitors and their notification destination must be configured and tested in Railway after confirming the account plan supports them. Add an external synthetic check for the learner workflow and an alert recipient controlled by the operator; do not treat service health checks as alerts.

Structured application failures include an operation name and correlation ID. Unexpected API failures return the ID in `X-Request-ID`; use it to find the corresponding log without exposing stack traces to users. Auth email failures log the operation, never the link, token, password, or email body. Audit rows record role changes, class publication, submissions, and grading.

On an email incident, disable registration, confirm SMTP configuration and sender authentication, and verify delivery to an operator-controlled inbox. Existing unverified users can request a new link after recovery. Auth mail uses a request-lifecycle background callback, not a durable mail queue; process termination can lose a send. A durable outbox is a future requirement if delivery recovery cannot rely on explicit resend.

On a database incident, keep writes failed closed, inspect platform status and safe database error codes, restore connectivity, and verify ownership checks and stored records before reopening affected actions. Avoid logging assignment bodies, full requests, or connection strings.

Expired session and rate-limit cleanup needs a scheduled maintenance policy before long-running production operation. Do not delete learner records merely because they are inactive without the approved retention policy.

## Validation commands

1. `npm ci`
2. `npm run lint`
3. `npm run typecheck`
4. `npm test`
5. `npm audit --omit=dev`
6. `npm run build`
7. `npm run db:migrate` twice against staging
8. `node scripts/check-auth-schema.mjs`
9. `node scripts/test-learning.mjs`

The integration script requires staging configuration, Playwright Chromium, and the SMTP test dependency. It starts its own local app and loopback SMTP capture, uses synthetic `example.test` accounts, and records results under ignored `test-results`. Capturing an email locally does not prove delivery from the production sender. Synthetic records remain tagged for diagnosis and must be removed by an explicitly scoped cleanup before using the database for real learners.

Release only the code and lockfile that passed the gates. Confirm the exact Railway deployment reaches `SUCCESS`, then check the public URL, TLS, safe headers, blocked registration, failed unauthorized requests, and expected data. A production account journey additionally requires real SMTP and approved account activation.
