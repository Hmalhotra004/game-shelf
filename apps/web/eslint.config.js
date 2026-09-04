// @ts-check
import { tanstackConfig } from "@tanstack/eslint-config";
import { defineConfig } from "eslint/config";

export default defineConfig([
  ...tanstackConfig,
  {
    rules: {
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
]);
