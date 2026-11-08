import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the Node backend runs on :4000 (cd server && npm run dev).
// Proxying it through Vite keeps everything same-origin, so no CORS setup is
// needed locally. Production uses VITE_API_URL instead (see src/lib/api.js).
const backend = process.env.BACKEND_URL || "http://localhost:4000";

// https://vitejs.dev/config/
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
