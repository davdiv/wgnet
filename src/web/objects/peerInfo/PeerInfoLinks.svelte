<script lang="ts">
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { allPeerLinksPeerMap$, allPeersMap$ } from "../../data";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import { upsertPeerLink, createPeerLinkId } from "../../requests";
	import { searchPeersExclude } from "../../search/search";
	import PeerDisplay from "../PeerDisplay.svelte";
	import PeerInfoLinksList from "./PeerInfoLinksList.svelte";

	export let peer: PeerInfo;

	$: connectedPeers = $allPeerLinksPeerMap$[peer.id] ?? [];
	$: connectedPeersInfo = connectedPeers.map((id) => $allPeersMap$[id] ?? { id }) ?? [];
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Links</span>
		<span class="badge badge-primary">{connectedPeersInfo.length}</span>
		<AutoComplete
			class="flex-grow"
			placeholder="Add link"
			selectSuggestion={(otherPeer) => {
				upsertPeerLink(createPeerLinkId(otherPeer.item.id, peer.id), "generate");
			}}
			getSuggestions={searchPeersExclude([...connectedPeers, peer.id])}
			let:suggestion
		>
			<PeerDisplay peer={suggestion.item} />
		</AutoComplete>
	</svelte:fragment>
	{#if connectedPeersInfo.length > 0}
		<PeerInfoLinksList peer1={peer} peers2={connectedPeersInfo} />
	{:else}
		<div>This peer is not linked to any other peer.</div>
	{/if}
</Collapse>
