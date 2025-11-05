import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(), solid(), tailwindcss()],
  resolve: {
    dedupe: ["solid-js"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/solid-monaco")) {
            return "solid-monaco";
          }
        },
        assetFileNames: (assetInfo) => {
          // Keep .wasm files with their original names
          if (assetInfo.name?.endsWith(".wasm")) {
            return "assets/[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    assetsInlineLimit: 0, // Disable inlining of assets (prevents base64 encoding)
  },
  // Ensure .wasm files are treated as assets, not modules
  assetsInclude: ["**/*.wasm"],
  // Tell Vite to exclude .wasm from being processed as JavaScript
  optimizeDeps: {
    exclude: ["markdown-renderer"],
  },
});
