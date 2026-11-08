import { withTransaction } from "./db.js";
import { getUserById } from "./auth.js";

/**
 * Saves a finished game and bumps each signed-in player's running totals.
 * players: { X: { userId, name, moves }, O: { userId, name, moves } }
 * Returns the updated public user for every signed-in player, keyed by piece.
 */
export async function recordGame({ mode, difficulty = null, players, winner, moveCount }) {
  await withTransaction(async (db) => {
    await db.query(
      `INSERT INTO games (mode, difficulty, x_user_id, o_user_id, x_name, o_name, winner, move_count)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        mode,
        difficulty,
        players.X?.userId ?? null,
        players.O?.userId ?? null,
        players.X?.name ?? null,
        players.O?.name ?? null,
        winner,
        moveCount,
      ]
    );

    for (const piece of ["X", "O"]) {
      const p = players[piece];
      if (!p?.userId) continue;
      await db.query(
        `UPDATE users
            SET games_played = games_played + 1,
                wins = wins + $2,
                total_moves = total_moves + $3
          WHERE id = $1`,
        [p.userId, winner === piece ? 1 : 0, p.moves || 0]
      );
    }
  });

  const updated = {};
  for (const piece of ["X", "O"]) {
    const id = players[piece]?.userId;
    if (id) updated[piece] = await getUserById(id);
  }
  return updated;
}
