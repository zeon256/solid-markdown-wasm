import {
  OPTIMIZE_DEPS_EXCLUDE,
  SHARED_ASSETS_INCLUDE,
  SHARED_ASSETS_INLINE_LIMIT,
  getAssetFileNames,
  getManualChunks,
} from "@solid-markdown-wasm/example-shared/vite-config";
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
        manualChunks: getManualChunks("solid-monaco"),
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
