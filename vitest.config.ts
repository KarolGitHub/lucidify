/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.config.ts",
        "**/types.ts",
      ],
    },
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
