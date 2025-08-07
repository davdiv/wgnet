<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import { PeerAccess, canHavePeerAccess, hasPeerAccess } from "../../../common/peerConditions/accessRights";
	import type { TagInfo } from "../../../node/database/requests/getAllTags";
	import { allPeersTagMap$, userInfo$ } from "../../data";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import Peers from "../../lists/Peers.svelte";
	import { setTags } from "../../requests";
	import { searchPeersExclude } from "../../search/search";
	import PeerDisplay from "../PeerDisplay.svelte";

	const { tag }: { tag: TagInfo } = $props();

	const peers = $derived($allPeersTagMap$[tag.id] ?? []);
</script>

<Collapse>
	{#snippet title()}
		<span class="flex-none">Peers</span>
		<span class="badge badge-primary">{peers.length}</span>
		{#if canHavePeerAccess(PeerAccess.WriteTags, $userInfo$.wgnet?.peerAccess)}
			<AutoComplete
				class="grow"
				placeholder="Add peer"
				selectSuggestion={(peer) => {
					setTags(peer.item.id, [...peer.item.tags, tag.id], peer.item.name);
				}}
				getSuggestions={searchPeersExclude(
					peers.map(({ id }) => id),
					PeerAccess.WriteTags,
				)}
			>
				{#snippet children({ suggestion })}
					<PeerDisplay peer={suggestion.item} />
				{/snippet}
			</AutoComplete>
		{/if}
	{/snippet}
	{#if peers.length > 0}
		<Peers {peers}>
			{#snippet children({ peer })}
				{#if hasPeerAccess(peer, PeerAccess.WriteTags, $userInfo$.wgnet?.peerAccess)}
					<button
						class="btn btn-sm btn-ghost"
						title="Remove tag from peer"
						onclick={() =>
							setTags(
								peer.id,
								peer.tags.filter((t) => t != tag.id),
								peer.name,
							)}><FaIcon icon={faTrash} /></button
					>
				{/if}
			{/snippet}
		</Peers>
	{:else}
		<div>This tag is not attached to any peer.</div>
	{/if}
</Collapse>
