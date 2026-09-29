# Significant decisions

**Decision:** Keep Next.js and PostgreSQL and use TekSpyk's branded multi-step waitlist as the public signup path while learner accounts remain closed. **Alternatives:** Open learner account signup or retire the waitlist. **Rationale:** The user selected the familiar waitlist flow; it does not falsely imply that classes or accounts are open, and existing waitlist data is preserved. The public form requires adult confirmation until the guardian-consent process is approved. **Revisit when:** Email delivery, privacy contact, waitlist retention, account policies, and the minor-consent process are ready for the corresponding launch scope.

**Decision:** Use Better Auth for verified email/password accounts. **Alternatives:** Custom password/session code or an external identity platform. **Rationale:** A maintained library supplies credential handling and revocation while using the existing database. The schema is checked against the installed package. **Revisit when:** Enterprise SSO, managed MFA, or operational requirements justify an identity provider.

**Decision:** Keep registration disabled until external launch dependencies are verified. **Alternatives:** Activate unverified accounts or simulate email. **Rationale:** An account journey cannot be called complete without genuine verification and reset delivery. **Revisit when:** SMTP, operator ownership, and account policies pass review.

**Decision:** Block minor activation on the server. **Alternatives:** A universal age checkbox or undocumented guardian approval. **Rationale:** Global access requires an actual jurisdiction and consent process. The present implementation has neither. **Revisit when:** The operator approves and implements that process, including data rights and retention.

**Decision:** Score objective questions from a fixed key, with teacher review and versioned grade changes. **Alternatives:** LLM grading of written answers. **Rationale:** A teacher controls consequential records; unvalidated model output is unsuitable as an authoritative grade. **Revisit when:** A documented evaluation and human review process supports assisted grading.

**Decision:** Add a per-request script nonce and dynamically render pages. **Alternatives:** Allow inline scripts broadly, or adopt experimental build-time integrity support. **Rationale:** A nonce provides a clear script policy using documented Next.js support. Existing presentation uses inline style attributes, so style policy currently permits them. **Revisit when:** Static-page performance measurements or style refactoring justify a different policy.

**Decision:** Keep published assessment wording fixed and permit draft edits. **Alternatives:** Mutate prompts under submitted work. **Rationale:** A grade should retain its original meaning. **Revisit when:** Explicit assessment versioning and migration rules are implemented.

References: [Better Auth installation](https://better-auth.com/docs/installation), [PostgreSQL adapter](https://better-auth.com/docs/adapters/postgresql), [email/password authentication](https://better-auth.com/docs/authentication/email-password), [Next.js CSP](https://nextjs.org/docs/app/guides/content-security-policy), [Railway variables](https://docs.railway.com/guides/variables).
