import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: __dirname,
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },

  test: {
    environment: "jsdom", // for frontend react tests
    globals: true,
    include: ["src/components/**/*.test.{ts,tsx}"],
    setupFiles: ["vitest.setup.ts"], // relative to project root or vite.config.ts location
    isolate: true,
    coverage: {
      exclude: ["**/*.config.ts"],
    },
  },
});
