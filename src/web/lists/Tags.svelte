<script lang="ts">
	import type { Snippet } from "svelte";
	import type { TagInfo } from "../../node/database/requests/getAllTags";
	import TagDisplay from "../objects/TagDisplay.svelte";
	import ListItemLink from "./ListItemLink.svelte";
	import { createListNavigation } from "./listNavigation";

	const navigation = createListNavigation();
	const { tags, children }: { tags: TagInfo[]; children?: Snippet<[{ tag: TagInfo }]> } = $props();
</script>

<div class="flex flex-col gap-1" use:navigation>
	{#each tags as tag (tag.id)}
		<ListItemLink href={`/tags/${tag.id}`}
			><TagDisplay {tag} />{#snippet actions()}
				{@render children?.({ tag })}
			{/snippet}</ListItemLink
		>
	{/each}
</div>
