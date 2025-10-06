// @ts-check
import oxlint from "eslint-plugin-oxlint";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";

const config = tseslint.config(
  tseslint.configs.strict,
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
        tsconfigBaseDir: import.meta.dirname,
        extraFileExtensions: [".vue"],
      },
    },
  },
  ...oxlint.buildFromOxlintConfigFile("./.oxlintrc.json"),
);

export default config;
