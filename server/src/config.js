const isProd = process.env.NODE_ENV === "production";

const databaseUrl = process.env.DATABASE_URL || (isProd ? "" : "postgres://localhost:5432/shift_dev");
if (!databaseUrl) {
  throw new Error("Missing required environment variable DATABASE_URL");
}

export const config = {
  isProd,
  port: Number(process.env.PORT || 4000),
  databaseUrl,
  // Comma-separated, e.g. https://shift-tic-tac-toe.vercel.app,http://localhost:5173
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean),
  sessionDays: Number(process.env.SESSION_DAYS || 30),
  turnSeconds: 20,
};
