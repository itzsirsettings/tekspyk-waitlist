import { randomBytes } from "node:crypto";
import { checkServerIdentity } from "node:tls";
import pg from "pg";

if (process.env.DEPLOYMENT_STAGE !== "production") {
  throw new Error("This script only provisions the production application role");
}
if (!process.env.DATABASE_URL || !process.env.DATABASE_SSL_CA) {
  throw new Error("Production database connection and verified CA are required");
}

const password = randomBytes(48).toString("base64url");
const appUrl = new URL(process.env.DATABASE_URL);
const connectionUrl = new URL(process.env.DATABASE_URL);
if (process.env.DATABASE_TUNNEL_PORT) {
  const tunnelPort = Number(process.env.DATABASE_TUNNEL_PORT);
  if (!Number.isInteger(tunnelPort) || tunnelPort < 1024 || tunnelPort > 65535) {
    throw new Error("DATABASE_TUNNEL_PORT must be a valid local TCP port");
  }
  connectionUrl.hostname = "127.0.0.1";
  connectionUrl.port = String(tunnelPort);
}
const client = new pg.Client({
  connectionString: connectionUrl.toString(),
  connectionTimeoutMillis: 15_000,
  query_timeout: 120_000,
  ssl: {
    ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"),
    rejectUnauthorized: true,
    checkServerIdentity: (_, cert) => checkServerIdentity("postgres.railway.internal", cert),
  },
});

try {
  await client.connect();
  await client.query("BEGIN");
  const existing = await client.query("SELECT 1 FROM pg_roles WHERE rolname = 'tekspyk_app'");
  if (existing.rowCount) throw new Error("Production application role already exists; refusing to rotate it implicitly");

  await client.query(`CREATE ROLE tekspyk_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '${password}'`);
  await client.query("GRANT CONNECT ON DATABASE railway TO tekspyk_app");
  await client.query("GRANT USAGE ON SCHEMA public TO tekspyk_app");

  const tables = await client.query(
    "SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'schema_migrations'",
  );
  for (const { tablename } of tables.rows) {
    if (!/^[a-z_][a-z0-9_]*$/.test(tablename)) throw new Error("Unexpected table name in public schema");
    const privileges = tablename === "learning_audit" ? "SELECT, INSERT" : "SELECT, INSERT, UPDATE, DELETE";
    await client.query(`GRANT ${privileges} ON TABLE public.${tablename} TO tekspyk_app`);
  }
  await client.query("GRANT SELECT ON TABLE public.schema_migrations TO tekspyk_app");
  await client.query("GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO tekspyk_app");
  await client.query("COMMIT");

  appUrl.username = "tekspyk_app";
  appUrl.password = password;
  process.stdout.write(appUrl.toString());
} catch (error) {
  try {
    await client.query("ROLLBACK");
  } catch (rollbackError) {
    console.error(`Production database rollback failed: ${rollbackError.code || "operation error"}`);
  }
  console.error(`Production application role provisioning failed: ${error.code || "operation error"}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
