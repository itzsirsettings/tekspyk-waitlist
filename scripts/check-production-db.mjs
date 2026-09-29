import { checkServerIdentity } from "node:tls";
import pg from "pg";

if (process.env.DEPLOYMENT_STAGE !== "production") {
  throw new Error("This check only targets the production database");
}
if (!process.env.DATABASE_URL || !process.env.DATABASE_SSL_CA) {
  throw new Error("Production database connection and verified CA are required");
}

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
  query_timeout: 30_000,
  ssl: {
    ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"),
    rejectUnauthorized: true,
    checkServerIdentity: (_, cert) => checkServerIdentity("postgres.railway.internal", cert),
  },
});

try {
  await client.connect();
  const identity = await client.query(
    "SELECT current_user AS role, current_database() AS database, rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user",
  );
  if (identity.rows[0]?.role !== "tekspyk_app" || identity.rows[0].database !== "railway") {
    throw new Error("Runtime connection is not using the restricted production application role");
  }
  if (identity.rows[0].rolsuper || identity.rows[0].rolcreatedb || identity.rows[0].rolcreaterole) {
    throw new Error("Runtime database role has elevated PostgreSQL privileges");
  }
  const migrationCount = await client.query("SELECT count(*)::int AS count FROM public.schema_migrations");
  if (migrationCount.rows[0]?.count !== 7) throw new Error("Expected production schema migrations are not present");
  const auditPrivileges = await client.query(
    "SELECT has_table_privilege(current_user, 'public.learning_audit', 'SELECT') AS can_read, has_table_privilege(current_user, 'public.learning_audit', 'INSERT') AS can_insert, has_table_privilege(current_user, 'public.learning_audit', 'UPDATE') AS can_update, has_table_privilege(current_user, 'public.learning_audit', 'DELETE') AS can_delete",
  );
  if (!auditPrivileges.rows[0].can_read || !auditPrivileges.rows[0].can_insert || auditPrivileges.rows[0].can_update || auditPrivileges.rows[0].can_delete) {
    throw new Error("Production audit table grants do not match append-only runtime access");
  }
  console.log("Production DB verified: TLS valid, application role least-privileged, seven migrations present, audit writes append-only.");
} finally {
  await client.end();
}
