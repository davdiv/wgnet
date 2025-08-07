<script lang="ts">
	import type { Snippet } from "svelte";
	import { navigate, pathname$ } from "./locationStore";
	import type { Match } from "./matchPath";
	import { matchPath } from "./matchPath";

	interface Props {
		component?: any;
		args?: any;
		prefix?: boolean;
		path?: string | string[];
		redirect?: null | string | ((match: Match) => string);
		children?: Snippet<[{ match: Match }]>;
	}

	const { component = undefined, args = {}, prefix = false, path = [], redirect = null, children }: Props = $props();

	function executeRedirect(match: Match | null, redirect: null | string | ((match: Match) => string)) {
		if (match && redirect) {
			if (typeof redirect === "function") {
				redirect = redirect(match);
			}
			if (redirect) {
				navigate(redirect, true);
			}
		}
	}

	const match: Match | null = $derived(matchPath($pathname$, path, prefix));

	$effect(() => {
		executeRedirect(match, redirect);
	});
</script>

{#if match}
	{@const SvelteComponent = component}
	{#if children}{@render children({ match })}{:else}
		<SvelteComponent {...args} {match} />
	{/if}
{/if}
