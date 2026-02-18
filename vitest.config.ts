import { defineConfig } from "vitest/config";

/// <reference types="vitest/config" />
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/.git/**", "**/dist/**"]
  }
});
