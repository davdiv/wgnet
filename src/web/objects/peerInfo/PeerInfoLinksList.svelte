<script lang="ts">
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { createListNavigation } from "../../lists/listNavigation";
	import PeerInfoLinksItem from "./PeerInfoLinksItem.svelte";

	const navigation = createListNavigation();

	const { peer1, peers2 }: { peer1: PeerInfo; peers2: PeerInfo[] } = $props();
</script>

<div class="flex flex-col gap-1" use:navigation>
	{#each peers2 as peer2 (peer2.id)}
		<PeerInfoLinksItem {peer1} {peer2} />
	{/each}
</div>
