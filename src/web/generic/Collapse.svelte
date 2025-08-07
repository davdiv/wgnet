<script lang="ts">
	import type { Snippet } from "svelte";
	const { title, children }: { title?: Snippet; children?: Snippet } = $props();
</script>

<details class="collapse collapse-arrow flex-none bg-base-200 overflow-visible isolation-auto">
	<summary class="collapse-title text-xl font-medium"><div class="flex gap-2 items-center">{@render title?.()}</div></summary>
	<div class="collapse-content flex flex-col gap-2 p-3">{@render children?.()}</div>
</details>
