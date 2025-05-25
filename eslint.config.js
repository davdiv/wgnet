import js from "@eslint/js";
import { default as parser } from "@typescript-eslint/parser";
import eslintConfigPrettier from "eslint-config-prettier";
import eslintPluginSvelte from "eslint-plugin-svelte";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";
import globals from "globals";

/** @type any */
const otherConfigs = [...tsEslint.configs.strict, ...eslintPluginSvelte.configs["flat/recommended"]];

/** @type import("eslint").Linter.Config[] */
export default [
	js.configs.recommended,
	...otherConfigs,
	eslintConfigPrettier,
	{
		languageOptions: {
			parser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: ["tsconfig.json", "tsconfig.node.json"],
				extraFileExtensions: [".svelte"],
			},
		},
		rules: {
			"svelte/no-at-html-tags": "off",
			"prefer-const": ["error", { destructuring: "all" }],
			"@typescript-eslint/prefer-literal-enum-member": ["error", { allowBitwiseExpressions: true }],
			"@typescript-eslint/no-extra-non-null-assertion": "off",
			"@typescript-eslint/consistent-type-imports": ["error", { disallowTypeAnnotations: false }],
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-explicit-any": "off",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-unused-vars": [
				"error",
				{
					args: "none",
					ignoreRestSiblings: true,
				},
			],
		},
	},
	{
		files: ["**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				parser,
			},
		},
	},
	{
		files: ["src/web/**"],
		languageOptions: {
			globals: globals.browser,
		},
	},
	{
		ignores: ["dist"],
	},
];
