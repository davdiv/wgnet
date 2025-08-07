<script lang="ts">
	import { faTag, faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { TagInfo } from "../../../node/database/requests/getAllTags";
	import { userInfo$ } from "../../data";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { removeTag } from "../../requests";
	import TagInfoBasic from "./TagInfoBasic.svelte";
	import TagInfoPeers from "./TagInfoPeers.svelte";

	const { tag }: { tag: TagInfo } = $props();
</script>

<div class="flex flex-col p-3 gap-2">
	<div class="flex gap-2 text-xl font-bold items-center">
		<FaIcon icon={faTag} /><span class="grow">{tag.name}</span>
		{#if $userInfo$.wgnet?.tagsAdmin}
			<button type="button" class="btn btn-sm btn-error" title="Remove tag" onclick={() => removeTag(tag.id, tag.name)}><FaIcon icon={faTrash} /><span class="hidden sm:inline">Remove</span></button>
		{/if}
	</div>
	<TagInfoBasic {tag} />
	<TagInfoPeers {tag} />
</div>
