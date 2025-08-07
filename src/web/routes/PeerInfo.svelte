<script lang="ts">
	import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
	import { allPeersMap$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import PeerInfo from "../objects/peerInfo/PeerInfo.svelte";
	import type { Match } from "../router/matchPath";

	const { match }: { match: Match } = $props();

	const peer = $derived($allPeersMap$[+match.params.id]);
</script>

{#if peer}
	{#key peer.id}
		<PeerInfo {peer} />
	{/key}
{:else}
	<div class="flex m-3">
		<div role="alert" class="alert alert-error">
			<FaIcon icon={faCircleXmark} />
			<span>The selected peer does not exist. It may have been deleted.</span>
		</div>
	</div>
{/if}
