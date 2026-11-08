import pg from "pg";
import { config } from "./config.js";

// Neon requires TLS. Its connection strings carry sslmode=require; local dev
// databases don't. We read the flag ourselves and strip it from the URL so pg
// doesn't print its sslmode deprecation warning.
const url = new URL(config.databaseUrl);
const sslmode = url.searchParams.get("sslmode");
url.searchParams.delete("sslmode");
url.searchParams.delete("channel_binding");
const needsSsl = ["require", "verify-ca", "verify-full"].includes(sslmode);

export const pool = new pg.Pool({
  connectionString: url.toString(),
  ssl: needsSsl ? { rejectUnauthorized: true } : undefined,
  max: 5,
  idleTimeoutMillis: 30_000,
  // a suspended Neon compute can take a few seconds to wake up
  connectionTimeoutMillis: 15_000,
});

pool.on("error", (err) => {
  console.error("Postgres pool error:", err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}
