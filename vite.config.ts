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
            "cd markdown-renderer && wasm-pack build --target web --release",
            (err, stdout, stderr) => {
              if (err) {
                console.log("Stdout:", stdout);
                console.log("Stderr:", stderr);
                reject(err);
              } else {
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
      external: ["solid-js", "solid-js/web"],
      output: {
        manualChunks(id) {
          if (id.includes("markdown-renderer")) {
            return "markdown-renderer";
          }
        },
      },
    },
  },
});
