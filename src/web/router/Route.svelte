<script lang="ts">
	import { navigate, pathname$ } from "./locationStore";
	import type { Match } from "./matchPath";
	import { matchPath } from "./matchPath";

	export let component: any = undefined;
	export let args: any = {};
	export let prefix = false;
	export let path: string | string[] = [];
	export let redirect: null | string | ((match: Match) => string) = null;

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

	let match: Match | null;
	$: match = matchPath($pathname$, path, prefix);

	$: executeRedirect(match, redirect);
</script>

{#if match}
	<slot {match}>
		<svelte:component this={component} {...args} {match} />
	</slot>
{/if}
