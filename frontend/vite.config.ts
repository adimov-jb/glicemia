import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Em desenvolvimento, /api vai para o FastAPI; mantém a mesma origem para o cookie de sessão.
    // No Docker, API_URL aponta para o contêiner do backend.
    proxy: { "/api": process.env.API_URL ?? "http://localhost:8000" },
    // Necessário no Docker em Windows/macOS, onde eventos de arquivo não chegam ao contêiner.
    watch: { usePolling: process.env.VITE_POLLING === "true" },
  },
});
