<script lang="ts">
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import Collapse from "../../generic/Collapse.svelte";
	import { addPeerEndpoint } from "../../requests";
	import PeerInfoEndpointItem from "./PeerInfoEndpointsItem.svelte";

	export let peer: PeerInfo;

	let newEndpoint = "";
	const addEndpoint = async () => {
		await addPeerEndpoint({ peer: peer.id, endpoint: newEndpoint, priority: 1, peerCondition: null });
		newEndpoint = "";
	};
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Endpoints</span>
		<span class="badge badge-primary">{peer.endpoints.length}</span>
		<form class="contents" on:submit|preventDefault={addEndpoint}>
			<input class="input input-ghost w-full" placeholder="Add endpoint" bind:value={newEndpoint} />
		</form>
	</svelte:fragment>
	{#if peer.endpoints.length > 0}
		<div class="flex flex-col">
			{#each peer.endpoints as endpoint}
				<PeerInfoEndpointItem {peer} {endpoint} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured endpoint.</div>
	{/if}
</Collapse>
