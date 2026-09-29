import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { checkServerIdentity } from "node:tls";
import nextEnv from "@next/env";
import pg from "pg";

nextEnv.loadEnvConfig(process.cwd());
const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required to run migrations");
const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), "../railway/migrations");
const connectionUrl = new URL(connectionString);
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
  connectionTimeoutMillis: 15000,
  query_timeout: 120000,
  statement_timeout: 90000,
  ssl: process.env.DATABASE_SSL_CA ? {
    ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"), rejectUnauthorized: true,
    checkServerIdentity: (host, cert) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME || host, cert),
  } : undefined,
});

try {
  console.log("Connecting to migration database with certificate verification");
  await client.connect();
  console.log("Database connected; acquiring migration lock");
  await client.query("SELECT pg_advisory_lock(738425991)");
  await client.query("CREATE TABLE IF NOT EXISTS schema_migrations (filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())");
  for (const filename of (await fs.readdir(directory)).filter((name) => name.endsWith(".sql")).sort()) {
    const sql = await fs.readFile(path.join(directory, filename), "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    const prior = await client.query("SELECT checksum FROM schema_migrations WHERE filename = $1", [filename]);
    if (prior.rowCount) {
      if (prior.rows[0].checksum !== checksum) throw new Error(`Applied migration changed: ${filename}`);
      console.log(`Already applied: ${filename}`); continue;
    }
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)", [filename, checksum]);
      await client.query("COMMIT");
      console.log(`Applied: ${filename}`);
    } catch (error) { await client.query("ROLLBACK"); throw error; }
  }
} catch (error) {
  console.error("Migration failed:", error.message);
  process.exitCode = 1;
} finally { await client.end(); }
