<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { TagInfo } from "../../../node/database/requests/getAllTags";
	import { allPeersTagMap$ } from "../../data";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import Peers from "../../lists/Peers.svelte";
	import { attachTag, detachTag } from "../../requests";
	import { searchPeersExclude } from "../../search/search";
	import PeerDisplay from "../PeerDisplay.svelte";

	export let tag: TagInfo;

	$: peers = $allPeersTagMap$[tag.id] ?? [];
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Peers</span>
		<span class="badge badge-primary">{peers.length}</span>
		<AutoComplete
			class="flex-grow"
			placeholder="Add peer"
			selectSuggestion={(peer) => {
				attachTag(peer.item.id, tag.id, peer.item.name, tag.name);
			}}
			getSuggestions={searchPeersExclude(peers.map(({ id }) => id))}
			let:suggestion
		>
			<PeerDisplay peer={suggestion.item} />
		</AutoComplete>
	</svelte:fragment>
	{#if peers.length > 0}
		<Peers {peers} let:peer>
			<button class="btn btn-sm btn-ghost" title="Remove tag from peer" on:click={() => detachTag(peer.id, tag.id, peer.name, tag.name)}><FaIcon icon={faTrash} /></button>
		</Peers>
	{:else}
		<div>This tag is not attached to any peer.</div>
	{/if}
</Collapse>
