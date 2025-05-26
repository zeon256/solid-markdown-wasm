import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
	plugins: [solid(), tailwindcss()],
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
			},
		},
	},
});
