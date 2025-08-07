<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { allTagsMap$ } from "./data";
	import TagDisplay from "./objects/TagDisplay.svelte";

	const { id, ...rest }: { id: number } & Omit<HTMLAttributes<HTMLDivElement>, "id"> = $props();

	const tagInfo = $derived($allTagsMap$[id]);
</script>

{#if tagInfo}
	<TagDisplay {...rest} tag={tagInfo} />
{:else}
	<div {...rest} class={["badge badge-info", rest.class]}>{id}</div>
{/if}
