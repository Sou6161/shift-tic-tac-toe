import { config } from "./config.js";
import { pool } from "./db.js";
import { migrate } from "./migrate.js";
import { createServer } from "./app.js";

async function main() {
  // Render's free plan has no pre-deploy step, so migrations run on every start.
  await migrate();

  const { server, io } = createServer();
  server.listen(config.port, () => {
    console.log(`Shift server listening on :${config.port}`);
    console.log(`Allowed origins: ${config.clientOrigins.join(", ")}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down`);
    io.close();
    server.close(() => pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(0), 8000).unref();
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error("Failed to start:", err);
  process.exit(1);
});
