<script lang="ts">
	import { faGear, faLock, faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { allPeerLinksMap$ } from "../../data";
	import FaIcon from "../../generic/FaIcon.svelte";
	import ListItemLink from "../../lists/ListItemLink.svelte";
	import { createPeerLinkId, removePeerLink } from "../../requests";
	import PeerDisplay from "../PeerDisplay.svelte";
	import PeerLinkPresharedKey from "../PeerLinkPresharedKey.svelte";

	export let peer1: PeerInfo;
	export let peer2: PeerInfo;
	let showDetails = false;

	$: linkId = createPeerLinkId(peer1.id, peer2.id);
	$: linkInfo = $allPeerLinksMap$[linkId];
</script>

<ListItemLink href={`/peers/${peer2.id}`}
	><PeerDisplay peer={peer2} />{#if linkInfo?.hasPSK}<span title="A preshared key has been configured for this link."><FaIcon icon={faLock} /></span>{/if}
	<svelte:fragment slot="actions">
		<div class="join">
			<button
				type="button"
				class="btn btn-sm btn-ghost join-item"
				class:btn-active={showDetails}
				title="Link details"
				on:click={() => {
					showDetails = !showDetails;
				}}><FaIcon icon={faGear} /></button
			>
			<button type="button" class="btn btn-sm btn-ghost join-item" title="Remove link with this peer" on:click={() => removePeerLink(linkId)}><FaIcon icon={faTrash} /></button>
		</div>
	</svelte:fragment>
</ListItemLink>
{#if showDetails}
	<PeerLinkPresharedKey {linkId} />
{/if}
