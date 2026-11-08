import { Router } from "express";
import { requireUser } from "../auth.js";
import { recordGame } from "../stats.js";
import { limitRequests } from "../rateLimit.js";

const router = Router();

// An AI game takes at least ~10s (the AI waits 2s per move), so one result per 8s is generous.
const resultLimit = limitRequests({ windowMs: 8000, max: 1 }, (req) => `ai:${req.user.id}`);

// Results come from the browser (the AI runs there), so they're trusted like any client-side score.
router.post("/ai", requireUser, resultLimit, async (req, res, next) => {
  try {
    const { winner, moves, difficulty } = req.body || {};
    if (!["X", "O", "draw"].includes(winner)) return res.status(400).json({ error: "Invalid result." });
    if (!["easy", "medium", "hard"].includes(difficulty)) return res.status(400).json({ error: "Invalid difficulty." });
    const moveCount = Number(moves);
    if (!Number.isInteger(moveCount) || moveCount < 0 || moveCount > 500)
      return res.status(400).json({ error: "Invalid move count." });

    const updated = await recordGame({
      mode: "ai",
      difficulty,
      winner,
      moveCount,
      players: {
        X: { userId: req.user.id, name: req.user.name, moves: moveCount },
        O: { userId: null, name: "Computer", moves: 0 },
      },
    });
    res.status(201).json({ user: updated.X });
  } catch (err) {
    next(err);
  }
});

export default router;
