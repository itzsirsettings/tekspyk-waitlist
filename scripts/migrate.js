const fs = require("node:fs");
const path = require("node:path");
const { Client } = require("pg");

// Load .env file manually if it exists to support local run
function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const index = trimmed.indexOf("=");
      if (index === -1) continue;
      const key = trimmed.slice(0, index).trim();
      const val = trimmed.slice(index + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Error: DATABASE_URL is not set. Please add it to your .env file or environment.");
  process.exit(1);
}

const migrationFile = path.join(__dirname, "..", "supabase", "migrations", "20260719160000_create_waitlist_entries.sql");
if (!fs.existsSync(migrationFile)) {
  console.error(`Error: Migration file not found at ${migrationFile}`);
  process.exit(1);
}

const sql = fs.readFileSync(migrationFile, "utf8");

async function main() {
  console.log("Connecting to PostgreSQL database...");
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log("Running migration...");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
