import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../schema";
import { execSync } from "child_process";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export async function migrateDatabase() {
  try {
    // 1) Generate any missing migrations (creates _journal.json)
    execSync("npx drizzle-kit generate --config ./drizzle.config.ts", { stdio: "inherit" });
    // 2) Apply all pending migrations
    execSync("npx drizzle-kit migrate  --config ./drizzle.config.ts", { stdio: "inherit" });
  } catch (err) {
    console.error("Migration failed:", err);
    throw err;
  }
}
