import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import pg from "pg";
import { checkServerIdentity } from "node:tls";
import { getMigrations } from "better-auth/db/migration";
loadEnvConfig(process.cwd());
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 15000, query_timeout: 120000,
  ssl: { ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"), rejectUnauthorized: true, checkServerIdentity: (_, cert) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME, cert) } });
try {
  const result = await getMigrations({ database: pool,
    user: { modelName: "learning_users", additionalFields: { role: { type: "string", defaultValue: "student", input: false }, adultConfirmed: { type: "boolean", required: true }, termsAccepted: { type: "boolean", required: true }, termsVersion: { type: "string", defaultValue: "2026-09-28" } } },
    session: { modelName: "learning_sessions" }, account: { modelName: "learning_accounts" }, verification: { modelName: "learning_verifications" },
    rateLimit: { enabled: true, storage: "database", modelName: "auth_rate_limits" },
  });
  console.log(JSON.stringify({ tablesMissing: result.toBeCreated, columnsMissing: result.toBeAdded, indexesMissing: result.toBeAddedIndexes, unsafeChanges: result.unsafeChanges, schemaProblems: result.schemaProblems }, null, 2));
  if (result.toBeCreated.length || result.toBeAdded.length || result.schemaProblems.length || result.unsafeChanges.length) process.exitCode = 1;
} finally { await pool.end(); }
