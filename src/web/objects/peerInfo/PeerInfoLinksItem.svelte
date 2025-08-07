<script lang="ts">
	import { faGear, faLock, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { PeerAccess, hasPeerAccess } from "../../../common/peerConditions/accessRights";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { allPeerLinksMap$, userInfo$ } from "../../data";
	import FaIcon from "../../generic/FaIcon.svelte";
	import ListItemLink from "../../lists/ListItemLink.svelte";
	import { createPeerLinkId, removePeerLink } from "../../requests";
	import PeerDisplay from "../PeerDisplay.svelte";
	import PeerLinkPresharedKey from "../PeerLinkPresharedKey.svelte";

	const { peer1, peer2 }: { peer1: PeerInfo; peer2: PeerInfo } = $props();
	let showDetails = $state(false);

	const linkId = $derived(createPeerLinkId(peer1.id, peer2.id));
	const linkInfo = $derived($allPeerLinksMap$[linkId]);

	const canEdit1 = $derived(hasPeerAccess(peer1, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess));
	const canEdit2 = $derived(hasPeerAccess(peer2, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess));
	const canEdit = $derived(canEdit1 && canEdit2);
	const canViewKey1 = $derived(hasPeerAccess(peer1, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess));
	const canViewKey2 = $derived(hasPeerAccess(peer2, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess));
	const canViewKey = $derived(canViewKey1 && canViewKey2);
</script>

<ListItemLink href={`/peers/${peer2.id}`}
	><PeerDisplay peer={peer2} />{#if linkInfo?.hasPSK}<span title="A preshared key has been configured for this link."><FaIcon icon={faLock} /></span>{/if}
	{#snippet actions()}
		{#if canEdit || canViewKey}
			<div class="join">
				<button
					type="button"
					class="btn btn-sm btn-ghost join-item"
					class:btn-active={showDetails}
					title="Link details"
					onclick={() => {
						showDetails = !showDetails;
					}}><FaIcon icon={faGear} /></button
				>
				{#if canEdit}
					<button type="button" class="btn btn-sm btn-ghost join-item" title="Remove link with this peer" onclick={() => removePeerLink(linkId)}><FaIcon icon={faTrash} /></button>
				{/if}
			</div>
		{/if}
	{/snippet}
</ListItemLink>
{#if showDetails}
	<PeerLinkPresharedKey {linkId} {canEdit} {canViewKey} />
{/if}
