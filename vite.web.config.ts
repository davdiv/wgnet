import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { compression } from "vite-plugin-compression2";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [svelte(), tailwindcss(), compression({ algorithms: ["brotliCompress"] })],
	build: {
		outDir: "dist/web",
	},
	server: {
		proxy: {
			"/api": "http://localhost:3000",
			"/login": "http://localhost:3000",
			"/logout": "http://localhost:3000",
		},
	},
});
