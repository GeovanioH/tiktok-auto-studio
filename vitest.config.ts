import { defineConfig } from "vitest/config";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const zodPath = path.dirname(require.resolve("zod"));
const sharpPath = path.dirname(require.resolve("sharp"));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "apps/**/*.{test,spec}.{ts,tsx}",
      "packages/**/*.{test,spec}.{ts,tsx}",
      "tests/**/*.{test,spec}.{ts,tsx}",
      "C:/Users/ADMIN/Documents/TEST/**/*.{test,spec}.{ts,tsx}"
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/*.spec.ts" // Exclude Playwright e2e specs from vitest unit test runner
    ]
  },
  resolve: {
    alias: {
      "@tiktok-studio/shared": path.resolve(__dirname, "packages/shared/src"),
      "@tiktok-studio/api": path.resolve(__dirname, "apps/api/src"),
      "@": path.resolve(__dirname, "apps/api/src"),
      "zod": zodPath,
      "sharp": sharpPath
    }
  }
});
