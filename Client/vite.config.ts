import { defineConfig } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ buffer: true, global: true, process: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      events: "rollup-plugin-node-polyfills/polyfills/events",
    },
  },

  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  define: {
    global: "globalThis",
  },
});
