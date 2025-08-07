<script lang="ts">
	import Route from "./Route.svelte";
	import Lazy from "./Lazy.svelte";
	interface Props {
		component: any;
		args?: any;
		prefix?: boolean;
		path: string;
	}

	const { component, args = {}, prefix = false, path }: Props = $props();
</script>

<Route {path} {prefix}>
	{#snippet children({ match })}
		<Lazy {component} args={{ ...args, match }} />
	{/snippet}
</Route>
