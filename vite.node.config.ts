import { chmod, cp, rename, writeFile } from "fs/promises";
import { defineConfig } from "vite";
import packageJson from "./package.json";
import { builtinModules } from "module";

const external = [...builtinModules, ...Object.keys(packageJson.dependencies)];

// https://vitejs.dev/config/
export default defineConfig({
	ssr: {
		noExternal: true,
	},
	build: {
		ssr: true,
		ssrEmitAssets: true,
		outDir: "dist",
		lib: {
			entry: {
				wgnet: "./src/node/main",
			},
			formats: ["es"],
		},
		rollupOptions: {
			external: (id) => id.startsWith("node:") || external.some((externalModule) => id === externalModule || id.startsWith(`${id}/`)),
			output: {
				banner: (chunk) => (chunk.isEntry ? "#!/usr/bin/env node\n" : ""),
			},
		},
	},
	plugins: [
		{
			name: "extra",
			async writeBundle(options, bundle) {
				await rename("dist/wgnet.js", "dist/wgnet");
				await chmod("dist/wgnet", 0o755);
				await cp("README.md", "dist/README.md");
				await cp("LICENSE.md", "dist/LICENSE.md");
				const pkg: Partial<typeof packageJson> = { ...packageJson };
				delete pkg.scripts;
				delete pkg.devDependencies;
				delete pkg.private;
				this.emitFile({
					type: "asset",
					fileName: "package.json",
					source: JSON.stringify(pkg),
				});
				await writeFile("dist/package.json", JSON.stringify(pkg));
			},
		},
	],
});
