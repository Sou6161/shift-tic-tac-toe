import crypto from "node:crypto";
import { config } from "../config.js";
import { applyMove, emptyBoard, findWinner, other } from "../game/rules.js";
import { recordGame } from "../stats.js";

// Rooms live in memory and only exist while players are connected; finished games go to Postgres.

const CODE_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";
const rooms = new Map();

const newCode = () => {
  let code;
  do {
    code = Array.from(crypto.randomBytes(6), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
  } while (rooms.has(code));
  return code;
};

const cleanName = (value) => {
  const name = typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, 24) : "";
  return name || "Player";
};

const pieceOf = (room, socketId) =>
  room.players.X?.socketId === socketId ? "X" : room.players.O?.socketId === socketId ? "O" : null;

function resetBoard(room) {
  room.board = emptyBoard();
  room.current = "X";
  room.moveCount = 0;
  room.moveCounts = { X: 0, O: 0 };
}

export function registerGameHandlers(io, socket) {
  const room = () => rooms.get(socket.data.roomCode);

  const clearTurnTimer = (r) => {
    if (r?.turnTimer) clearTimeout(r.turnTimer);
    if (r) r.turnTimer = null;
  };

  // The server owns the clock: 20s turns plus 1s grace for latency, then the turn passes.
  const startTurnTimer = (r) => {
    clearTurnTimer(r);
    r.turnTimer = setTimeout(() => {
      if (r.status !== "playing") return;
      r.current = other(r.current);
      io.to(r.code).emit("turnChange", r.current);
      startTurnTimer(r);
    }, (config.turnSeconds + 1) * 1000);
  };

  const leaveCurrentRoom = () => {
    const r = room();
    if (!r) return;
    const piece = pieceOf(r, socket.id);
    socket.leave(r.code);
    socket.data.roomCode = null;
    if (!piece) return;

    clearTurnTimer(r);
    if (piece === "X") {
      // The host left: the room goes away.
      const guest = r.players.O;
      rooms.delete(r.code);
      if (guest) {
        const guestSocket = io.sockets.sockets.get(guest.socketId);
        guestSocket?.leave(r.code);
        if (guestSocket) guestSocket.data.roomCode = null;
        io.to(guest.socketId).emit("roomClosed", "The host closed the room.");
      }
    } else {
      // The guest left: the host keeps the room open for someone else.
      r.players.O = null;
      r.status = "waiting";
      resetBoard(r);
      if (r.players.X) io.to(r.players.X.socketId).emit("opponentLeft");
    }
  };

  socket.on("createRoom", (name) => {
    leaveCurrentRoom();
    const code = newCode();
    const r = {
      code,
      status: "waiting",
      players: { X: { socketId: socket.id, name: cleanName(name) }, O: null },
      turnTimer: null,
    };
    resetBoard(r);
    rooms.set(code, r);
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit("roomCreated", code);
  });

  socket.on("joinRoom", (payload) => {
    const code = typeof payload?.room === "string" ? payload.room.trim().toLowerCase() : "";
    const r = rooms.get(code);
    if (!r) return socket.emit("roomError", "We couldn't find that room. Check the code and try again.");
    if (pieceOf(r, socket.id)) return socket.emit("roomError", "You're already in this room.");
    if (r.players.O) return socket.emit("roomError", "That room already has two players.");

    leaveCurrentRoom();
    const name = cleanName(payload?.name);
    r.players.O = { socketId: socket.id, name };
    r.status = "ready";
    socket.join(code);
    socket.data.roomCode = code;
    socket.emit("roomJoined", { room: code, opponentName: r.players.X.name });
    io.to(r.players.X.socketId).emit("opponentJoined", name);
  });

  socket.on("startGame", () => {
    const r = room();
    if (!r || pieceOf(r, socket.id) !== "X" || !r.players.O || r.status !== "ready") return;
    resetBoard(r);
    r.status = "playing";
    io.to(r.code).emit("gameStarted");
    startTurnTimer(r);
  });

  socket.on("move", async (payload) => {
    const r = room();
    if (!r || r.status !== "playing") return;
    const piece = pieceOf(r, socket.id);
    if (!piece || piece !== r.current) return socket.emit("roomError", "Hang on, it's not your turn.");

    const result = applyMove(r.board, piece, r.moveCount, payload?.move);
    if (result.error) return socket.emit("roomError", result.error);

    r.board = result.board;
    r.moveCount += 1;
    r.moveCounts[piece] += 1;
    io.to(r.code).emit("updateBoard", r.board);
    io.to(r.code).emit("updateMoveCounts", r.moveCounts);

    const winner = findWinner(r.board);
    if (!winner) {
      r.current = other(piece);
      startTurnTimer(r);
      return;
    }

    r.status = "over";
    clearTurnTimer(r);
    io.to(r.code).emit("gameOver", { winner, moveCounts: r.moveCounts });

    const seat = (p) => {
      const player = r.players[p];
      const s = player && io.sockets.sockets.get(player.socketId);
      return player ? { userId: s?.data.user?.id ?? null, name: player.name, moves: r.moveCounts[p] } : null;
    };
    try {
      const updated = await recordGame({
        mode: "online",
        winner,
        moveCount: r.moveCount,
        players: { X: seat("X"), O: seat("O") },
      });
      for (const p of ["X", "O"]) {
        if (updated[p] && r.players[p]) io.to(r.players[p].socketId).emit("statsUpdated", updated[p]);
      }
    } catch (err) {
      console.error("Failed to record online game:", err.message);
    }
  });

  // Ignored: the server's own turn timer is what counts.
  socket.on("timeUp", () => {});

  socket.on("rematch", () => {
    const r = room();
    if (!r || pieceOf(r, socket.id) !== "X" || r.status !== "over" || !r.players.O) return;
    resetBoard(r);
    r.status = "playing";
    io.to(r.code).emit("rematchAccepted", {
      board: r.board,
      currentPlayer: "X",
      moveCount: 0,
      timer: config.turnSeconds,
    });
    startTurnTimer(r);
  });

  socket.on("leaveRoom", leaveCurrentRoom);
  socket.on("disconnect", leaveCurrentRoom);
}

