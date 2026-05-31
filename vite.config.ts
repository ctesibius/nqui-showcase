import path from "node:path"
import { fileURLToPath } from "node:url"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
    dedupe: ["recharts"],
  },
  // Bind to loopback only so dev does not trigger “local network” device prompts on some mobile browsers.
  server: {
    host: "127.0.0.1",
    strictPort: true,
    port: 5173,
  },
})
