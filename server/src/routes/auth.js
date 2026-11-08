import { Router } from "express";
import { query } from "../db.js";
import {
  hashPassword,
  verifyPassword,
  createSession,
  deleteSession,
  toPublicUser,
  requireUser,
  USER_COLUMNS,
} from "../auth.js";
import { limitRequests } from "../rateLimit.js";

const router = Router();

// 10 sign-in / sign-up attempts per IP per 15 minutes
const authLimit = limitRequests({ windowMs: 15 * 60 * 1000, max: 10 });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (v) => (typeof v === "string" ? v.trim() : "");

router.post("/signup", authLimit, async (req, res, next) => {
  try {
    const name = clean(req.body?.name);
    const email = clean(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!name || name.length > 40) return res.status(400).json({ error: "Pick a name up to 40 characters." });
    if (!EMAIL_RE.test(email) || email.length > 254) return res.status(400).json({ error: "That email doesn't look right." });
    if (password.length < 8 || password.length > 200)
      return res.status(400).json({ error: "Use a password of at least 8 characters." });

    const passwordHash = await hashPassword(password);
    let row;
    try {
      const result = await query(
        `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
         RETURNING id, name, email, wins, games_played, total_moves`,
        [name, email, passwordHash]
      );
      row = result.rows[0];
    } catch (err) {
      if (err.code === "23505") return res.status(409).json({ error: "There's already an account with that email." });
      throw err;
    }

    const token = await createSession(row.id);
    res.status(201).json({ token, user: toPublicUser(row) });
  } catch (err) {
    next(err);
  }
});

router.post("/signin", authLimit, async (req, res, next) => {
  try {
    const email = clean(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!email || !password) return res.status(400).json({ error: "Enter your email and password." });

    const { rows } = await query(
      `SELECT ${USER_COLUMNS}, u.password_hash FROM users u WHERE lower(u.email) = $1`,
      [email]
    );
    const row = rows[0];
    const ok = row ? await verifyPassword(password, row.password_hash) : false;
    if (!ok) return res.status(401).json({ error: "That email and password don't match." });

    const token = await createSession(row.id);
    res.json({ token, user: toPublicUser(row) });
  } catch (err) {
    next(err);
  }
});

router.post("/signout", async (req, res, next) => {
  try {
    await deleteSession(req.token);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

router.get("/me", requireUser, (req, res) => {
  res.json({ user: req.user });
});

export default router;
