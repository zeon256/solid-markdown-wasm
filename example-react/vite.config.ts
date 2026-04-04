import {
  OPTIMIZE_DEPS_EXCLUDE,
  SHARED_ASSETS_INCLUDE,
  SHARED_ASSETS_INLINE_LIMIT,
  getAssetFileNames,
  getManualChunks,
} from "@solid-markdown-wasm/example-shared/vite-config";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  plugins: [wasm(), react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: getManualChunks("monaco-editor"),
        assetFileNames: getAssetFileNames(),
      },
    },
    assetsInlineLimit: SHARED_ASSETS_INLINE_LIMIT,
  },
  assetsInclude: SHARED_ASSETS_INCLUDE,
  optimizeDeps: {
    exclude: OPTIMIZE_DEPS_EXCLUDE,
  },
});
