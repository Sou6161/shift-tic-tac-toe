import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, withTransaction } from "./db.js";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations");

/**
 * Applies any .sql files in /migrations that haven't run yet, in name order.
 * Each file runs in its own transaction. The transaction-scoped advisory lock
 * stops two instances migrating at once, and also works through Neon's pooler.
 */
export async function migrate({ log = console.log } = {}) {
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
    name TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);

  let applied = 0;
  for (const file of files) {
    const ran = await withTransaction(async (client) => {
      await client.query("SELECT pg_advisory_xact_lock(727274)");
      const { rowCount } = await client.query("SELECT 1 FROM schema_migrations WHERE name = $1", [file]);
      if (rowCount) return false;
      const sql = await fs.readFile(path.join(dir, file), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      return true;
    });
    if (ran) {
      applied += 1;
      log(`migration applied: ${file}`);
    }
  }
  return applied;
}

// `npm run migrate`
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  migrate()
    .then((n) => console.log(n ? `${n} migration(s) applied` : "database is up to date"))
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
