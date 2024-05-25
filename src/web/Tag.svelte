<script lang="ts">
	import TagDisplay from "./objects/TagDisplay.svelte";
	import { allTagsMap$ } from "./data";

	export let id: number;

	$: tagInfo = $allTagsMap$[id];
</script>

{#if tagInfo}
	<TagDisplay tag={tagInfo} {...$$restProps} />
{:else}
	<div {...$$restProps} class="badge badge-info {$$restProps.class}">{id}</div>
{/if}
