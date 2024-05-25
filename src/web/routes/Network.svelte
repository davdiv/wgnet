<script lang="ts">
	import { allPeerLinksDataSet$, allPeersDataSet$, selectedPeerLinks$, selectedPeers$ } from "../data";
	import Network from "../generic/Network.svelte";
	import PeerLink from "../objects/PeerLink.svelte";
	import { createPeerLinkId } from "../requests";
	import { navigate } from "../router/locationStore";

	const onDoubleClick = ({ nodes, edges }: { nodes: number[]; edges: string[] }) => {
		if (nodes.length === 1 && edges.length === 0) {
			navigate(`/peers/${nodes[0]}`);
		}
	};
</script>

<div class="flex flex-col -mt-16 pt-16 min-h-dvh">
	<div class="grow relative">
		<Network
			{onDoubleClick}
			class="absolute top-0 bottom-0 left-0 right-0"
			nodes={$allPeersDataSet$}
			edges={$allPeerLinksDataSet$}
			bind:selectedNodes={$selectedPeers$}
			bind:selectedEdges={$selectedPeerLinks$}
		/>
	</div>
	{#if $selectedPeers$.length === 2 && $selectedPeerLinks$.length === 0}
		<div class="flex-none"><PeerLink linkId={createPeerLinkId($selectedPeers$[0], $selectedPeers$[1])} /></div>
	{:else if $selectedPeers$.length === 0 && $selectedPeerLinks$.length === 1}
		<div class="flex-none"><PeerLink linkId={$selectedPeerLinks$[0]} /></div>
	{/if}
</div>
