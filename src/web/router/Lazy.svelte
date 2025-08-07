<script lang="ts">
	import type { Snippet } from "svelte";

	interface Props {
		component: () => Promise<{ default: any }>;
		args?: any;
		children?: Snippet;
		error?: Snippet;
	}

	const { component, args = {}, children, error }: Props = $props();
	const promise = $derived(component());
</script>

{#await promise}
	{@render children?.()}
{:then resolvedComponent}
	<resolvedComponent.default {...args} />
{:catch}
	{@render error?.()}
{/await}
