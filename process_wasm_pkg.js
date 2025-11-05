#!/usr/bin/env bun

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PKG_DIR = resolve("markdown-renderer/pkg");
const JS_FILE = resolve(PKG_DIR, "markdown_renderer.js");

console.log("Processing wasm-pack output to use external .wasm file...");

try {
  // Read the generated JavaScript file
  const content = readFileSync(JS_FILE, "utf-8");

  // Modify the import to use ?url suffix for Vite
  // This tells Vite to treat it as an asset URL instead of a module to bundle
  const modifiedContent = content.replace(
    "new URL('markdown_renderer_bg.wasm', import.meta.url)",
    "new URL('./markdown_renderer_bg.wasm?url', import.meta.url).href",
  );

  if (content !== modifiedContent) {
    writeFileSync(JS_FILE, modifiedContent, "utf-8");
    console.log("✓ Modified wasm import to use ?url suffix");
  } else {
    console.log("⚠ No modifications needed or pattern not found");
  }

  // Verify no base64 inlining
  const base64Pattern = /data:application\/wasm;base64,/;
  if (base64Pattern.test(content)) {
    console.error(
      "✗ Found base64-encoded wasm! This shouldn't happen with wasm-pack --target web",
    );
    process.exit(1);
  }

  console.log("✓ Post-processing complete");
} catch (err) {
  console.error("Error processing wasm package:", err);
  process.exit(1);
}
