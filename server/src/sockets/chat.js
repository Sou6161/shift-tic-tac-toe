import { query } from "../db.js";
import { createLimiter } from "../rateLimit.js";

/*
 * "Table talk": a discussion board for signed-in players, stored in Postgres.
 *
 * Client → server: userJoined, sendMessage({ message }), sendReply({ messageId, reply }),
 *                  deleteMessage({ messageId }), deleteReply({ messageId, replyId }),
 *                  updateLikes({ messageId, action: like|unlike|dislike|undislike })
 * Server → client: chatHistory(messages), newMessage(message),
 *                  messageUpdated(message), messageDeleted(id), chatError(text)
 *
 * The author is always the signed-in user on the socket; any userId or
 * username the client sends is ignored.
 */

const ROOM = "table-talk";
const HISTORY_LIMIT = 100;

// 5 posts or replies per user per 30 seconds
const postLimit = createLimiter({ windowMs: 30_000, max: 5 });

const MESSAGE_SQL = `
  SELECT m.id, m.user_id, u.name AS username, m.body, m.created_at,
         COALESCE(SUM(CASE WHEN v.vote = 1 THEN 1 ELSE 0 END), 0)::int AS likes,
         COALESCE(SUM(CASE WHEN v.vote = -1 THEN 1 ELSE 0 END), 0)::int AS dislikes,
         MAX(CASE WHEN v.user_id = $1 THEN v.vote END) AS my_vote
    FROM messages m
    JOIN users u ON u.id = m.user_id
    LEFT JOIN message_votes v ON v.message_id = m.id`;

async function loadMessages({ viewerId, messageId = null }) {
  const params = [viewerId ?? 0];
  let where = "";
  if (messageId !== null) {
    params.push(messageId);
    where = "WHERE m.id = $2";
  }
  const { rows } = await query(
    `SELECT * FROM (
       ${MESSAGE_SQL} ${where}
       GROUP BY m.id, u.name
       ORDER BY m.created_at DESC
       LIMIT ${HISTORY_LIMIT}
     ) recent ORDER BY created_at ASC`,
    params
  );
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const replies = await query(
    `SELECT r.id, r.message_id, r.user_id, u.name AS username, r.body, r.created_at
       FROM replies r JOIN users u ON u.id = r.user_id
      WHERE r.message_id = ANY($1::int[])
      ORDER BY r.created_at ASC`,
    [ids]
  );
  const byMessage = new Map(ids.map((id) => [id, []]));
  for (const r of replies.rows) {
    byMessage.get(r.message_id).push({
      id: r.id,
      userId: r.user_id,
      username: r.username,
      reply: r.body,
      timestamp: r.created_at,
    });
  }

  return rows.map((m) => ({
    id: m.id,
    userId: m.user_id,
    username: m.username,
    message: m.body,
    timestamp: m.created_at,
    likes: m.likes,
    dislikes: m.dislikes,
    myVote: m.my_vote ?? 0,
    replies: byMessage.get(m.id),
  }));
}

/** Broadcast copy of a message: drop the per-viewer vote. */
async function publicMessage(messageId) {
  const [message] = await loadMessages({ viewerId: null, messageId });
  if (!message) return null;
  delete message.myVote;
  return message;
}

const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const id = (v) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? n : null;
};

export function registerChatHandlers(io, socket) {
  const user = () => socket.data.user;

  // Wraps a handler: requires sign-in and reports failures to the sender.
  const handle = (fn) => async (payload) => {
    if (!user()) return socket.emit("chatError", "Sign in to join the conversation.");
    try {
      await fn(payload || {});
    } catch (err) {
      console.error("chat error:", err.message);
      socket.emit("chatError", "Something went wrong. Try again in a moment.");
    }
  };

  socket.on(
    "userJoined",
    handle(async () => {
      socket.join(ROOM);
      socket.emit("chatHistory", await loadMessages({ viewerId: user().id }));
    })
  );

  socket.on(
    "sendMessage",
    handle(async ({ message }) => {
      const body = text(message, 2000);
      if (!body) return;
      if (!postLimit(user().id)) return socket.emit("chatError", "You're posting quickly. Take a breather.");
      const { rows } = await query("INSERT INTO messages (user_id, body) VALUES ($1, $2) RETURNING id", [user().id, body]);
      io.to(ROOM).emit("newMessage", await publicMessage(rows[0].id));
    })
  );

  socket.on(
    "sendReply",
    handle(async ({ messageId, reply }) => {
      const mid = id(messageId);
      const body = text(reply, 1000);
      if (!mid || !body) return;
      if (!postLimit(user().id)) return socket.emit("chatError", "You're posting quickly. Take a breather.");
      const { rowCount } = await query(
        `INSERT INTO replies (message_id, user_id, body)
         SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM messages WHERE id = $1)`,
        [mid, user().id, body]
      );
      if (rowCount) io.to(ROOM).emit("messageUpdated", await publicMessage(mid));
    })
  );

  socket.on(
    "deleteMessage",
    handle(async ({ messageId }) => {
      const mid = id(messageId);
      if (!mid) return;
      const { rowCount } = await query("DELETE FROM messages WHERE id = $1 AND user_id = $2", [mid, user().id]);
      if (rowCount) io.to(ROOM).emit("messageDeleted", mid);
    })
  );

  socket.on(
    "deleteReply",
    handle(async ({ messageId, replyId }) => {
      const mid = id(messageId);
      const rid = id(replyId);
      if (!mid || !rid) return;
      const { rowCount } = await query(
        "DELETE FROM replies WHERE id = $1 AND message_id = $2 AND user_id = $3",
        [rid, mid, user().id]
      );
      if (rowCount) io.to(ROOM).emit("messageUpdated", await publicMessage(mid));
    })
  );

  socket.on(
    "updateLikes",
    handle(async ({ messageId, action }) => {
      const mid = id(messageId);
      if (!mid) return;
      if (action === "like" || action === "dislike") {
        await query(
          `INSERT INTO message_votes (message_id, user_id, vote)
           SELECT $1, $2, $3 WHERE EXISTS (SELECT 1 FROM messages WHERE id = $1)
           ON CONFLICT (message_id, user_id) DO UPDATE SET vote = EXCLUDED.vote`,
          [mid, user().id, action === "like" ? 1 : -1]
        );
      } else if (action === "unlike" || action === "undislike") {
        await query("DELETE FROM message_votes WHERE message_id = $1 AND user_id = $2 AND vote = $3", [
          mid,
          user().id,
          action === "unlike" ? 1 : -1,
        ]);
      } else {
        return;
      }
      const updated = await publicMessage(mid);
      if (updated) io.to(ROOM).emit("messageUpdated", updated);
    })
  );
}
