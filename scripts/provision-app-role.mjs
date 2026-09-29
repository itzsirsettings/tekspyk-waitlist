import fs from "node:fs/promises";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { checkServerIdentity } from "node:tls";
import pg from "pg";

loadEnvConfig(process.cwd());
if (process.env.DEPLOYMENT_STAGE !== "staging") throw Error("This bootstrap is scoped to the new staging database");
const secretPath = ".railway-secrets/app-role.json";
let password;
try { password = JSON.parse(await fs.readFile(secretPath, "utf8")).password; }
catch (error) { if (error.code !== "ENOENT") throw error; password = randomBytes(48).toString("hex"); }
if (!/^[a-f0-9]{96}$/.test(password)) throw Error("Invalid generated role credential");
const client = new pg.Client({ connectionString: process.env.MIGRATION_DATABASE_URL, connectionTimeoutMillis: 15000, query_timeout: 120000,
  ssl: { ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"), rejectUnauthorized: true, checkServerIdentity: (_, cert) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME, cert) } });
try {
  await client.connect(); await client.query("BEGIN");
  const exists = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'tekspyk_app'");
  if (!exists.rowCount) await client.query(`CREATE ROLE tekspyk_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '${password}'`);
  else if (!(await fs.stat(secretPath).catch(() => null))) throw Error("Role already exists without its local credential record; refusing to rotate implicitly");
  await client.query("GRANT CONNECT ON DATABASE railway TO tekspyk_app; GRANT USAGE ON SCHEMA public TO tekspyk_app;");
  const tables = await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename <> 'schema_migrations'");
  for (const { tablename } of tables.rows) {
    if (!/^[a-z_]+$/.test(tablename)) throw Error("Unexpected table name");
    const privileges = tablename === "learning_audit" ? "SELECT, INSERT" : "SELECT, INSERT, UPDATE, DELETE";
    await client.query(`GRANT ${privileges} ON TABLE public.${tablename} TO tekspyk_app`);
  }
  await client.query("GRANT SELECT ON TABLE public.schema_migrations TO tekspyk_app");
  await client.query("COMMIT");
  await fs.writeFile(secretPath, JSON.stringify({ role: "tekspyk_app", password }));
  const url = new URL(process.env.DATABASE_URL); url.username = "tekspyk_app"; url.password = password;
  const env = await fs.readFile(".env.local", "utf8");
  await fs.writeFile(".env.local", env.replace(/^DATABASE_URL=.*$/m, () => `DATABASE_URL=${JSON.stringify(url.toString())}`));
  console.log("Application role provisioned; app connection switched to restricted privileges. Audit rows cannot be updated or deleted by the app.");
} catch (error) { console.error("Role provisioning failed:", error.code || error.message); process.exitCode = 1; }
finally { await client.end(); }
