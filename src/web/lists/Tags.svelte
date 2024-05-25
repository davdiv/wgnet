<script lang="ts">
	import type { TagInfo } from "../../node/database/requests/getAllTags";
	import TagDisplay from "../objects/TagDisplay.svelte";
	import ListItemLink from "./ListItemLink.svelte";
	import { createListNavigation } from "./listNavigation";

	const navigation = createListNavigation();

	export let tags: TagInfo[];
</script>

<div class="flex flex-col gap-1" use:navigation>
	{#each tags as tag (tag.id)}
		<ListItemLink href={`/tags/${tag.id}`}><TagDisplay {tag} /><svelte:fragment slot="actions"><slot {tag} /></svelte:fragment></ListItemLink>
	{/each}
</div>
