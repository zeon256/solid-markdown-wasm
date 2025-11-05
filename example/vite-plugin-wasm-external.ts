import type { Plugin } from "vite";
import { copyFileSync } from "node:fs";
import { resolve } from "node:path";

export function wasmExternal(): Plugin {
  return {
    name: "wasm-external",
    apply: "build",
    generateBundle() {
      // Copy the wasm file to the output directory
      const wasmSource = resolve(
        __dirname,
        "../markdown-renderer/pkg/markdown_renderer_bg.wasm"
      );
      const wasmDest = resolve(__dirname, "dist/assets/markdown_renderer_bg.wasm");
      
      try {
        copyFileSync(wasmSource, wasmDest);
        console.log("✓ Copied WASM file to dist/assets/");
      } catch (err) {
        console.error("Failed to copy WASM file:", err);
      }
    },
  };
}
