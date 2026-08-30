import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "./",
  plugins: [react()],
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["tests/setup.ts"],
  },
});
