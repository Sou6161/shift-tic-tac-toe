import http from "node:http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { config } from "./config.js";
import { query } from "./db.js";
import { loadUser, userFromToken } from "./auth.js";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/games.js";
import { registerGameHandlers } from "./sockets/game.js";
import { registerChatHandlers } from "./sockets/chat.js";

export function createServer() {
  const app = express();
  // Render puts one proxy in front of the app; this makes req.ip the visitor's IP.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  const corsOptions = {
    origin(origin, cb) {
      // no Origin header = curl, health checks, same-origin
      if (!origin || config.clientOrigins.includes(origin)) return cb(null, true);
      cb(null, false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  };

  app.use(cors(corsOptions));
  app.use(express.json({ limit: "16kb" }));

  // No DB query: Render polls this every few seconds and keep-alive pings hit it, so touching Neon here would stop it ever suspending.
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/api/health/db", async (_req, res) => {
    try {
      await query("SELECT 1");
      res.json({ ok: true, db: "up" });
    } catch {
      res.status(503).json({ ok: false, db: "down" });
    }
  });

  app.use("/api", loadUser);
  app.use("/api/auth", authRoutes);
  app.use("/api/games", gameRoutes);

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found." }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON." });
    console.error(err);
    res.status(500).json({ error: "Something went wrong on our side." });
  });

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: config.clientOrigins, methods: ["GET", "POST"] },
    maxHttpBufferSize: 32 * 1024,
  });

  // Guests may connect signed out; a token in the handshake or via "authenticate" attaches the account.
  io.use(async (socket, next) => {
    try {
      socket.data.user = await userFromToken(socket.handshake.auth?.token);
    } catch (err) {
      console.error("socket auth failed:", err.message);
      socket.data.user = null;
    }
    next();
  });

  io.on("connection", (socket) => {
    socket.on("authenticate", async (token, ack) => {
      try {
        socket.data.user = await userFromToken(token);
      } catch {
        socket.data.user = null;
      }
      if (typeof ack === "function") ack({ ok: Boolean(socket.data.user) });
    });

    registerGameHandlers(io, socket);
    registerChatHandlers(io, socket);
  });

  return { app, server, io };
}
