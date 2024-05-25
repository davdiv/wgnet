<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { allTagsMap$ } from "../../data";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import Tags from "../../lists/Tags.svelte";
	import { attachTag, detachTag } from "../../requests";
	import { searchTagsExclude } from "../../search/search";
	import TagDisplay from "../TagDisplay.svelte";

	export let peer: PeerInfo;

	$: tagsInfo = peer.tags.map((id) => $allTagsMap$[id] ?? { id });
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Tags</span>
		<span class="badge badge-primary">{peer.tags.length}</span>
		<AutoComplete
			placeholder="Add tag"
			class="grow"
			selectSuggestion={(tag) => {
				attachTag(peer.id, tag.item.id, peer.name, tag.item.name);
			}}
			getSuggestions={searchTagsExclude(peer.tags)}
			let:suggestion
		>
			<TagDisplay tag={suggestion.item} />
		</AutoComplete>
	</svelte:fragment>
	{#if peer.tags.length > 0}
		<Tags tags={tagsInfo} let:tag>
			<button type="button" class="btn btn-sm btn-ghost" title="Remove tag from peer" on:click={() => detachTag(peer.id, tag.id, peer.name, $allTagsMap$[tag.id].name)}
				><FaIcon icon={faTrash} /></button
			>
		</Tags>
	{:else}
		<div>This peer has no tag.</div>
	{/if}
</Collapse>
