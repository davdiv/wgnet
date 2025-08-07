<script lang="ts">
	import { faGear, faPlusCircle, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { PeerAccess, hasPeerAccess } from "../../common/peerConditions/accessRights";
	import { allPeerLinksMap$, allPeersMap$, userInfo$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { removePeerLink, upsertPeerLink } from "../requests";
	import Link from "../router/Link.svelte";
	import PeerLinkPresharedKey from "./PeerLinkPresharedKey.svelte";

	let { linkId, showDetails = $bindable(false) }: { linkId: string; showDetails?: boolean } = $props();

	const linkInfo = $derived($allPeerLinksMap$[linkId]);
	const [peer1, peer2] = $derived(linkId.split("-"));
	const peer1Info = $derived($allPeersMap$[+peer1]);
	const peer2Info = $derived($allPeersMap$[+peer2]);
	const canEdit1 = $derived(hasPeerAccess(peer1Info, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess));
	const canEdit2 = $derived(hasPeerAccess(peer2Info, PeerAccess.WriteLink, $userInfo$.wgnet?.peerAccess));
	const canEdit = $derived(canEdit1 && canEdit2);
	const canViewKey1 = $derived(hasPeerAccess(peer1Info, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess));
	const canViewKey2 = $derived(hasPeerAccess(peer2Info, PeerAccess.ReadLinkKey, $userInfo$.wgnet?.peerAccess));
	const canViewKey = $derived(canViewKey1 && canViewKey2);
</script>

<div class="m-3 flex flex-col">
	<div class="flex gap-2 items-center">
		<Link class="link" href={`/peers/${peer1Info.id}`}>{peer1Info.name}</Link><span>/</span><Link class="link" href={`/peers/${peer2Info.id}`}>{peer2Info.name}</Link>
		{#if linkInfo}
			{#if canEdit}
				<button type="button" class="btn btn-ghost btn-sm flex-none" onclick={() => removePeerLink(linkId)} title="Remove link">
					<FaIcon icon={faTrash} /><span class="hidden md:inline">Remove link</span>
				</button>
			{/if}
			<div class="grow"></div>
			<button type="button" class="btn btn-ghost btn-sm flex-none" class:btn-active={showDetails} onclick={() => (showDetails = !showDetails)}><FaIcon icon={faGear} /></button>
		{:else if canEdit}
			<button type="button" class="btn btn-ghost btn-sm" onclick={() => upsertPeerLink(linkId, "generate")}><FaIcon icon={faPlusCircle} />Link peers</button>
		{/if}
	</div>
	{#if showDetails}
		<PeerLinkPresharedKey {linkId} {canEdit} {canViewKey} />
	{/if}
</div>
