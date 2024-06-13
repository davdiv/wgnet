<script lang="ts">
	import { faGear, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { allPeerLinksMap$, allPeersMap$, userInfo$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { removePeerLink, upsertPeerLink } from "../requests";
	import PeerLinkPresharedKey from "./PeerLinkPresharedKey.svelte";
	import Link from "../router/Link.svelte";
	import { PeerAccess, hasPeerAccess } from "../../common/peerConditions/accessRights";

	export let linkId: string;

	export let showDetails = false;

	$: linkInfo = $allPeerLinksMap$[linkId];
	$: [peer1, peer2] = linkId.split("-");
	$: peer1Info = $allPeersMap$[+peer1];
	$: peer2Info = $allPeersMap$[+peer2];
	$: canEdit1 = hasPeerAccess(peer1Info, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess);
	$: canEdit2 = hasPeerAccess(peer2Info, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess);
	$: canEdit = canEdit1 && canEdit2;
	$: canViewKey1 = hasPeerAccess(peer1Info, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess);
	$: canViewKey2 = hasPeerAccess(peer2Info, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess);
	$: canViewKey = canViewKey1 && canViewKey2;
</script>

<div class="m-3 flex flex-col">
	<div class="flex gap-2 items-center">
		<Link class="link" href={`/peers/${peer1Info.id}`}>{peer1Info.name}</Link><span>/</span><Link class="link" href={`/peers/${peer2Info.id}`}>{peer2Info.name}</Link>
		{#if linkInfo}
			{#if canEdit}
				<button type="button" class="btn btn-ghost btn-sm flex-none" on:click={() => removePeerLink(linkId)} title="Remove link">
					<FaIcon icon={faTrash} /><span class="hidden md:inline">Remove link</span>
				</button>
			{/if}
			<div class="grow" />
			<button type="button" class="btn btn-ghost btn-sm flex-none" class:btn-active={showDetails} on:click={() => (showDetails = !showDetails)}><FaIcon icon={faGear} /></button>
		{:else if canEdit}
			<button type="button" class="btn btn-ghost btn-sm" on:click={() => upsertPeerLink(linkId, "generate")}><FaIcon icon={faPlusCircle} />Link peers</button>
		{/if}
	</div>
	{#if showDetails}
		<PeerLinkPresharedKey {linkId} {canEdit} {canViewKey} />
	{/if}
</div>
