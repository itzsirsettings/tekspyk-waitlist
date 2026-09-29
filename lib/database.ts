import { Pool, type PoolClient } from "pg";
import { checkServerIdentity } from "node:tls";

let pool: Pool | undefined;

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add the Railway PostgreSQL connection string before accepting signups.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      statement_timeout: 15_000,
      ssl: process.env.DATABASE_SSL_CA ? {
        ca: process.env.DATABASE_SSL_CA.replaceAll("\\n", "\n"),
        rejectUnauthorized: true,
        checkServerIdentity: (host, certificate) => checkServerIdentity(process.env.DATABASE_SSL_SERVERNAME || host, certificate),
      } : undefined,
    });
    pool.on("error", () => console.error(JSON.stringify({ event: "database_pool_error" })));
  }

  return pool;
}

export async function withTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getDatabasePool().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try { await client.query("ROLLBACK"); }
    catch { console.error(JSON.stringify({ event: "database_rollback_failed" })); }
    throw error;
  } finally { client.release(); }
}
