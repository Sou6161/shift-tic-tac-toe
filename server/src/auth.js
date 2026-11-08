import crypto from "node:crypto";
import { promisify } from "node:util";
import { query } from "./db.js";
import { config } from "./config.js";

const scrypt = promisify(crypto.scrypt);
const KEYLEN = 64;

// Stored as scrypt$<salt hex>$<hash hex>. scrypt is built into Node, so there
// is no native bcrypt module to compile on Render.
export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, saltHex, hashHex] = String(stored).split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return crypto.timingSafeEqual(expected, actual);
}

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");

export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString("base64url");
  await query(
    `INSERT INTO sessions (token_hash, user_id, expires_at)
     VALUES ($1, $2, now() + make_interval(days => $3))`,
    [sha256(token), userId, config.sessionDays]
  );
  return token;
}

export async function deleteSession(token) {
  if (token) await query("DELETE FROM sessions WHERE token_hash = $1", [sha256(token)]);
}

export const USER_COLUMNS = "u.id, u.name, u.email, u.wins, u.games_played, u.total_moves";

export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    stats: { wins: row.wins, gamesPlayed: row.games_played, totalMoves: row.total_moves },
  };
}

export async function userFromToken(token) {
  if (!token || typeof token !== "string" || token.length > 200) return null;
  const { rows } = await query(
    `SELECT ${USER_COLUMNS}
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = $1 AND s.expires_at > now()`,
    [sha256(token)]
  );
  return toPublicUser(rows[0]);
}

export async function getUserById(id) {
  const { rows } = await query(`SELECT ${USER_COLUMNS} FROM users u WHERE u.id = $1`, [id]);
  return toPublicUser(rows[0]);
}

export function bearerToken(req) {
  const header = req.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/** Express middleware: sets req.user (or null) from the Authorization header. */
export async function loadUser(req, _res, next) {
  try {
    req.token = bearerToken(req);
    req.user = await userFromToken(req.token);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Please sign in first." });
  next();
}
