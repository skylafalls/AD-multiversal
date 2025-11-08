import browserlist from "browserslist";
import { browserslistToTargets } from "lightningcss";
import { defineConfig } from "rolldown-vite";
import { fileURLToPath } from "node:url";
import vue2 from "@vitejs/plugin-vue2";

const config = defineConfig({
  base: "/AD-multiversal/",
  css: {
    transformer: "postcss",
    lightningcss: {
      targets: browserslistToTargets(browserlist("> 0.1% and not dead and supports justify-content-space-evenly")),
    },
  },
  plugins: [vue2()],
  resolve: {
    extensions: [".js", ".ts", ".json", ".vue"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "#utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "#mechanics": fileURLToPath(new URL("./src/core/game-mechanics", import.meta.url)),
      "#env": fileURLToPath(new URL("./src/env.js", import.meta.url)),
    },
  },
  experimental: {
    enableNativePlugin: true,
  },
  build: {
    cssMinify: "lightningcss",
    minify: "esbuild",
  },
});

export default config;
