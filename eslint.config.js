// @ts-check
import { defineConfig } from "@eslint/config-helpers";

import oxlint from "eslint-plugin-oxlint";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";

const config = defineConfig(
  tseslint.configs.strictTypeChecked,
  ...vue.configs["flat/vue2-recommended"],
  stylistic.configs.recommended,
  {
    rules: {
      "@stylistic/quotes": ["error", "double"],
      "@stylistic/semi": ["error", "always"],
      "@stylistic/brace-style": ["error", "1tbs"],
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  {
    files: ["**/*.ts", "**/*.js", "**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        projectService: true,
        tsconfig: "./tsconfig.json",
        extraFileExtensions: [".vue"],
      },
    },
  },
  {
    ignores: ["public/**/*.js", "src/components/SliderComponent.vue", "src/supported-browsers.js", "src/steam/bindings/PlayFabClientApi.js", "dist", "node_modules"],
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
);

export default config;
