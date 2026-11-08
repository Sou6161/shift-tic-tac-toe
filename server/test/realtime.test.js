// End-to-end tests over real HTTP + sockets against a throwaway database.
// Uses TEST_DATABASE_URL, defaulting to a local shift_test database.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || "postgres://localhost:5432/shift_test";
process.env.CLIENT_ORIGINS = "http://localhost:5173";

const { pool } = await import("../src/db.js");
const { migrate } = await import("../src/migrate.js");
const { createServer } = await import("../src/app.js");
const { io: connect } = await import("socket.io-client");

let base;
let server;
let io;
const sockets = [];

const once = (socket, event, ms = 3000) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timed out waiting for ${event}`)), ms);
    socket.once(event, (data) => {
      clearTimeout(t);
      resolve(data);
    });
  });

const open = (token) => {
  const s = connect(base, { auth: token ? { token } : {}, transports: ["websocket"], forceNew: true });
  sockets.push(s);
  return s;
};

const api = async (path, body, token) => {
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};

before(async () => {
  await pool.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  await migrate({ log: () => {} });
  ({ server, io } = createServer());
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
});

after(async () => {
  sockets.forEach((s) => s.close());
  io.close();
  await new Promise((r) => server.close(r));
  await pool.end();
});

test("online game: rooms, turn order, illegal moves, win, stats saved", async () => {
  const host = await api("/api/auth/signup", { name: "Host", email: "host@test.dev", password: "password1" });
  assert.equal(host.status, 201);

  const x = open(host.body.token); // signed in
  const o = open(); // guest

  x.emit("createRoom", "Host");
  const code = await once(x, "roomCreated");
  assert.match(code, /^[a-z0-9]{6}$/);

  o.emit("joinRoom", { name: "nope", room: "zzzzzz" });
  assert.match(await once(o, "roomError"), /couldn't find/);

  const joined = once(o, "roomJoined");
  const arrived = once(x, "opponentJoined");
  o.emit("joinRoom", { name: "Guest", room: code.toUpperCase() });
  assert.deepEqual(await joined, { room: code, opponentName: "Host" });
  assert.equal(await arrived, "Guest");

  // only the host can start
  o.emit("startGame", code);
  const started = Promise.all([once(x, "gameStarted"), once(o, "gameStarted")]);
  x.emit("startGame", code);
  await started;

  // O can't move first
  o.emit("move", { room: code, move: [0] });
  assert.match(await once(o, "roomError"), /not your turn/);

  const play = async (s, move) => {
    const done = Promise.all([once(x, "updateBoard"), once(o, "updateBoard")]);
    s.emit("move", { room: code, move });
    return (await done)[0];
  };

  // placement: X 0, O 3, X 1, O 4, X 5, O 8
  await play(x, [0]);
  await play(o, [3]);
  await play(x, [1]);
  await play(o, [4]);
  await play(x, [5]);
  const afterPlacement = await play(o, [8]);
  assert.deepEqual(afterPlacement, ["X", "X", null, "O", "O", "X", null, null, "O"]);

  // shifting: placement-style move is rejected now
  x.emit("move", { room: code, move: [2] });
  assert.match(await once(x, "roomError"), /Pick up a piece/);

  // X shifts 5 -> 2 to complete the top row
  const over = Promise.all([once(x, "gameOver"), once(o, "gameOver")]);
  const stats = once(x, "statsUpdated");
  x.emit("move", { room: code, move: [5, 2] });
  const [result] = await over;
  assert.equal(result.winner, "X");
  assert.deepEqual(result.moveCounts, { X: 4, O: 3 });

  const updated = await stats;
  assert.deepEqual(updated.stats, { wins: 1, gamesPlayed: 1, totalMoves: 4 });

  const { rows } = await pool.query("SELECT mode, winner, x_name, o_name, o_user_id FROM games");
  assert.deepEqual(rows, [{ mode: "online", winner: "X", x_name: "Host", o_name: "Guest", o_user_id: null }]);

  // rematch resets the board for both
  const rematch = Promise.all([once(x, "rematchAccepted"), once(o, "rematchAccepted")]);
  x.emit("rematch", { room: code });
  const [r] = await rematch;
  assert.deepEqual(r.board, Array(9).fill(null));

  // guest leaves: host is told and keeps the room
  const left = once(x, "opponentLeft");
  o.emit("leaveRoom", code);
  await left;
});

test("host leaving closes the room for the guest", async () => {
  const x = open();
  const o = open();
  x.emit("createRoom", "A");
  const code = await once(x, "roomCreated");
  o.emit("joinRoom", { name: "B", room: code });
  await once(o, "roomJoined");
  const closed = once(o, "roomClosed");
  x.disconnect();
  assert.match(await closed, /closed/);
});

test("table talk: sign-in required, posts, votes, replies, delete own only", async () => {
  const guest = open();
  guest.emit("userJoined", {});
  assert.match(await once(guest, "chatError"), /Sign in/);

  const a = await api("/api/auth/signup", { name: "Ana", email: "ana@test.dev", password: "password1" });
  const b = await api("/api/auth/signup", { name: "Ben", email: "ben@test.dev", password: "password1" });
  const sa = open(a.body.token);
  const sb = open(b.body.token);

  sa.emit("userJoined", {});
  sb.emit("userJoined", {});
  assert.deepEqual(await once(sa, "chatHistory"), []);
  await once(sb, "chatHistory");

  const posted = once(sb, "newMessage");
  sa.emit("sendMessage", { userId: 999, username: "Spoofed", message: "  corner opening wins  " });
  const msg = await posted;
  assert.equal(msg.username, "Ana", "author comes from the session, not the payload");
  assert.equal(msg.userId, a.body.user.id);
  assert.equal(msg.message, "corner opening wins");

  let upd = once(sa, "messageUpdated");
  sb.emit("updateLikes", { messageId: msg.id, action: "like" });
  assert.equal((await upd).likes, 1);

  upd = once(sa, "messageUpdated");
  sb.emit("updateLikes", { messageId: msg.id, action: "dislike" });
  const switched = await upd;
  assert.deepEqual([switched.likes, switched.dislikes], [0, 1], "a vote switches, never doubles");

  upd = once(sa, "messageUpdated");
  sb.emit("sendReply", { messageId: msg.id, reply: "center is better" });
  const withReply = await upd;
  assert.equal(withReply.replies[0].username, "Ben");

  // Ben can't delete Ana's message
  sb.emit("deleteMessage", { messageId: msg.id });
  await new Promise((r) => setTimeout(r, 200));
  const { rowCount } = await pool.query("SELECT 1 FROM messages WHERE id = $1", [msg.id]);
  assert.equal(rowCount, 1);

  // history shows Ben's own vote
  const late = open(b.body.token);
  late.emit("userJoined", {});
  const [h] = await once(late, "chatHistory");
  assert.equal(h.myVote, -1);

  const gone = once(sb, "messageDeleted");
  sa.emit("deleteMessage", { messageId: msg.id });
  assert.equal(await gone, msg.id);
});

test("authenticate after connecting attaches the account", async () => {
  const u = await api("/api/auth/signup", { name: "Late", email: "late@test.dev", password: "password1" });
  const s = open();
  s.emit("userJoined", {});
  await once(s, "chatError");
  const ack = await new Promise((r) => s.emit("authenticate", u.body.token, r));
  assert.equal(ack.ok, true);
  s.emit("userJoined", {});
  assert.ok(Array.isArray(await once(s, "chatHistory")));
});

test("running out of time passes the turn", async () => {
  const { config } = await import("../src/config.js");
  const saved = config.turnSeconds;
  config.turnSeconds = 0; // timer fires after the 1s grace period
  try {
    const x = open();
    const o = open();
    x.emit("createRoom", "A");
    const code = await once(x, "roomCreated");
    o.emit("joinRoom", { name: "B", room: code });
    await once(x, "opponentJoined");
    x.emit("startGame", code);
    await once(o, "gameStarted");
    assert.equal(await once(o, "turnChange", 3000), "O");
  } finally {
    config.turnSeconds = saved;
  }
});
