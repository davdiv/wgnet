import daisyUI from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/web/**/*.{svelte,js,ts}", "./index.html"],
	plugins: [daisyUI],
};
