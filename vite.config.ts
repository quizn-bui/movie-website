import { defineConfig } from "vite"
import react from "@vitejs/plugin-react";
import { resolve } from "path"
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
