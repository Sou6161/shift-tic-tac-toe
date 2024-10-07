import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // This exposes the server to your network
    port: 5173, // Default Vite port, change if needed
  },
  build: {
    outDir: 'dist', // Specify the output directory
    emptyOutDir: true, // Empty the output directory before building
  },
});