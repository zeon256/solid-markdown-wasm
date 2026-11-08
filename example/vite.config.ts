import {
  OPTIMIZE_DEPS_EXCLUDE,
  SHARED_ASSETS_INCLUDE,
  SHARED_ASSETS_INLINE_LIMIT,
  getAssetFileNames,
  getManualChunks,
} from "@solid-markdown-wasm/example-shared/vite-config";
import stylex from "@stylexjs/unplugin";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import wasm from "vite-plugin-wasm";

export default defineConfig({
  // StyleX must run before solid(): vite-plugin-solid only feeds JSX files to
  // Babel, so `*.stylex.ts` modules would otherwise reach the browser uncompiled.
  plugins: [stylex.vite({ useCSSLayers: true }), wasm(), solid()],
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
