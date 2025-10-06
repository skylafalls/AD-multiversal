import { defineConfig } from "rolldown-vite";
import { fileURLToPath } from "node:url";
import vue2 from "@vitejs/plugin-vue2";

const config = defineConfig({
  base: "/AD-multiversal/",
  plugins: [vue2()],
  resolve: {
    extensions: [".js", ".ts", ".json", ".vue"],
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});

export default config;
