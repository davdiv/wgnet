<script lang="ts">
	import type { Snippet } from "svelte";
	import type { PeerInfo } from "../../node/database/requests/getAllPeers";
	import PeerDisplay from "../objects/PeerDisplay.svelte";
	import ListItemLink from "./ListItemLink.svelte";
	import { createListNavigation } from "./listNavigation";

	const navigation = createListNavigation();

	const { peers, children }: { peers: PeerInfo[]; children?: Snippet<[{ peer: PeerInfo }]> } = $props();
</script>

<div class="flex flex-col gap-1" use:navigation>
	{#each peers as peer (peer.id)}
		<ListItemLink href={`/peers/${peer.id}`}
			><PeerDisplay {peer} />{#snippet actions()}
				{@render children?.({ peer })}
			{/snippet}</ListItemLink
		>
	{/each}
</div>
