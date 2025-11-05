import { exec } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [
    solid(),
    dts({
      insertTypesEntry: true,
      include: ["src"],
      tsconfigPath: "./tsconfig.app.json",
    }),
    {
      name: "cargo-build",
      buildStart: () => {
        return new Promise((resolve, reject) => {
          exec(
            "cd markdown-renderer && wasm-pack build --target web --release && cd .. && bun process_wasm_pkg.js",
            (err, stdout, stderr) => {
              if (err) {
                console.log("Stdout:", stdout);
                console.log("Stderr:", stderr);
                reject(err);
              } else {
                console.log(stdout);
                resolve();
              }
            },
          );
        });
      },
    },
    {
      name: "copy-wasm-files",
      closeBundle: () => {
        return new Promise((resolve, reject) => {
          exec(
            "cp markdown-renderer/pkg/markdown_renderer_bg.wasm markdown-renderer/pkg/markdown_renderer_bg.wasm.d.ts dist/",
            (err) => {
              if (err) {
                console.error("Failed to copy wasm files:", err);
                reject(err);
              } else {
                console.log("✓ Copied .wasm and .d.ts files to dist/");
                resolve();
              }
            },
          );
        });
      },
    },
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SolidCmark",
      fileName: (format) => `solid-markdown-wasm.${format}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      external: ["solid-js", "solid-js/web", "markdown-renderer", /\.wasm$/],
      output: {
        assetFileNames: (assetInfo) => {
          // Keep .wasm files with their original names
          if (assetInfo.name?.endsWith(".wasm")) {
            return "[name][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    assetsInlineLimit: 0, // Disable inlining of assets (prevents base64 encoding)
  },
  // Ensure .wasm files are treated as assets, not modules
  assetsInclude: ["**/*.wasm"],
});
