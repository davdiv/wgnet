<script lang="ts">
	let scrolled = false;

	const updateScrolled = () => {
		scrolled = document.documentElement.scrollTop != 0;
	};
</script>

<svelte:window on:scroll={updateScrolled} />
<div class="navbar bg-base-100 top-0 fixed z-10 opacity-90" class:shadow-2xl={scrolled}>
	<slot />
</div>
