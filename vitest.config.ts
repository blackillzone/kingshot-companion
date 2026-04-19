import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/kingshot-companion/",
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**"],
      exclude: ["src/test/**"],
      thresholds: {
        // Global: permissive for now (components will be added later)
        global: {
          statements: 20,
          branches: 15,
          functions: 15,
          lines: 20,
        },
        // Per-file: stricter for lib files we're testing
        "src/lib/formulas.ts": {
          statements: 80,
          branches: 70,
          functions: 80,
          lines: 80,
        },
        "src/lib/heroes.ts": {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        "src/lib/storage.ts": {
          statements: 90,
          branches: 100,
          functions: 85,
          lines: 90,
        },
      },
    },
  },
});
