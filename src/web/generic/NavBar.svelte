<script lang="ts">
	import type { Snippet } from "svelte";

	const { children }: { children?: Snippet } = $props();

	let scrolled = $state(false);

	const updateScrolled = () => {
		scrolled = document.documentElement.scrollTop != 0;
	};
</script>

<svelte:window onscroll={updateScrolled} />
<div class="navbar bg-base-100 top-0 fixed z-10 opacity-90" class:shadow-2xl={scrolled}>
	{@render children?.()}
</div>
