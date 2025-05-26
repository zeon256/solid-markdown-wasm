import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import dts from 'vite-plugin-dts'
import { resolve } from "path";

export default defineConfig({
  plugins: [solid(), dts({ insertTypesEntry: true, include: ['src'], tsconfigPath: './tsconfig.app.json'}) ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SolidCmark',
      fileName: (format) => `solid-cmark.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['solid-js', "solid-js/web"],
    },
  },
})
