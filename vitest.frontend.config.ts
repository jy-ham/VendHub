import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["frontend/src/components/**/*.test.{ts,tsx}"],
    setupFiles: ["vitest.setup.ts"],
    isolate: true,
    coverage: {
      exclude: ["**/*.config.ts"],
    },
  },
});
