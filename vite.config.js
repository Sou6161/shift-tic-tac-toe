import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from 'path';

const faviconPath = resolve(__dirname, 'favicon.png');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, 
    port: 5173, 
    headers: {
      'Link': `<${faviconPath}>; rel="icon"`,
    },
  },
  build: {
    outDir: 'dist', 
    emptyOutDir: true, 
  },
}); 