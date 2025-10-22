/// <reference types="vitest" />

import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    exclude: ["node_modules", "token-list/evm.json"],
    globals: true,
    include: ["**/*.{test,spec}.{js,ts}"],
    retry: process.env.CI ? 10 : 0,
    testTimeout: process.env.CI ? 180_000 : 60_000, // 3 minutes in CI, 1 minute locally
  },
});
