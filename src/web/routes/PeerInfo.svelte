<script lang="ts">
	import PeerInfo from "../objects/peerInfo/PeerInfo.svelte";
	import type { Match } from "../router/matchPath";
	import { allPeersMap$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

	export let match: Match;

	$: peer = $allPeersMap$[+match.params.id];
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
