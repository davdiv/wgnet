<script lang="ts">
	import type { PeerInfo } from "../../node/database/requests/getAllPeers";
	import PeerDisplay from "../objects/PeerDisplay.svelte";
	import ListItemLink from "./ListItemLink.svelte";
	import { createListNavigation } from "./listNavigation";

	const navigation = createListNavigation();
	export let peers: PeerInfo[];
</script>

<div class="flex flex-col gap-1" use:navigation>
	{#each peers as peer (peer.id)}
		<ListItemLink href={`/peers/${peer.id}`}><PeerDisplay {peer} /><svelte:fragment slot="actions"><slot {peer} /></svelte:fragment></ListItemLink>
	{/each}
</div>
