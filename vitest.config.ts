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
    reporters: process.env.CI ? ["default", "github-actions"] : ["default"],
    retry: process.env.CI ? 20 : 5,
    testTimeout: process.env.CI ? 180_000 : 60_000, // 3 minutes in CI, 1 minute locally
  },
});
