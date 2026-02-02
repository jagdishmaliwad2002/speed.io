import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  // Frontend root
  root: path.resolve(__dirname, "client"),

  // Required for Vercel + production
  base: "/",

  plugins: [react()],

  // 🔴 ALL ALIASES DEFINED HERE
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },

  build: {
    // Build ONLY frontend
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});
