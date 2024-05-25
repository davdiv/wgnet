<script lang="ts">
	import { faGear, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { allPeerLinksMap$, allPeersMap$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { removePeerLink, upsertPeerLink } from "../requests";
	import PeerLinkPresharedKey from "./PeerLinkPresharedKey.svelte";
	import Link from "../router/Link.svelte";

	export let linkId: string;

	export let showDetails = false;

	$: linkInfo = $allPeerLinksMap$[linkId];
	$: [peer1, peer2] = linkId.split("-");
	$: peer1Info = $allPeersMap$[+peer1];
	$: peer2Info = $allPeersMap$[+peer2];
</script>

<div class="m-3 flex flex-col">
	<div class="flex gap-2 items-center">
		<Link class="link" href={`/peers/${peer1Info.id}`}>{peer1Info.name}</Link><span>/</span><Link class="link" href={`/peers/${peer2Info.id}`}>{peer2Info.name}</Link>
		{#if linkInfo}
			<button type="button" class="btn btn-ghost btn-sm flex-none" on:click={() => removePeerLink(linkId)} title="Remove link">
				<FaIcon icon={faTrash} /><span class="hidden md:inline">Remove link</span>
			</button>
			<div class="grow" />
			<button type="button" class="btn btn-ghost btn-sm flex-none" class:btn-active={showDetails} on:click={() => (showDetails = !showDetails)}><FaIcon icon={faGear} /></button>
		{:else}
			<button type="button" class="btn btn-ghost btn-sm" on:click={() => upsertPeerLink(linkId, "generate")}><FaIcon icon={faPlusCircle} />Link peers</button>
		{/if}
	</div>
	{#if showDetails}
		<PeerLinkPresharedKey {linkId} />
	{/if}
</div>
