import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev proxies the backend on :4000 so everything is same-origin; production uses VITE_API_URL.
const backend = process.env.BACKEND_URL || "http://localhost:4000";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": { target: backend, changeOrigin: true },
      "/socket.io": { target: backend, changeOrigin: true, ws: true },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
