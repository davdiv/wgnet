<script lang="ts">
	import { faFileExport, faServer, faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { removePeer } from "../../requests";
	import Link from "../../router/Link.svelte";
	import PeerInfoAddresses from "./PeerInfoAddresses.svelte";
	import PeerInfoAllowedIPs from "./PeerInfoAllowedIPs.svelte";
	import PeerInfoBasic from "./PeerInfoBasic.svelte";
	import PeerInfoEndpoints from "./PeerInfoEndpoints.svelte";
	import PeerInfoKey from "./PeerInfoKey.svelte";
	import PeerInfoLinks from "./PeerInfoLinks.svelte";
	import PeerInfoTags from "./PeerInfoTags.svelte";
	import { PeerAccess, hasPeerAccess } from "../../../common/peerConditions/accessRights";
	import { userInfo$ } from "../../data";

	interface Props {
		peer: PeerInfo;
	}

	const { peer }: Props = $props();

	const canEdit = $derived(hasPeerAccess(peer, PeerAccess.WriteOwnConfig, $userInfo$.wgnet?.peerAccess));
</script>

<div class="flex flex-col p-3 gap-2">
	<div class="flex gap-2 text-xl font-bold items-center">
		<FaIcon icon={faServer} /><span class="grow">{peer.name}</span>
		{#if hasPeerAccess(peer, PeerAccess.CreateDelete, $userInfo$.wgnet?.peerAccess)}
			<button type="button" class="btn btn-sm btn-error" title="Remove peer" onclick={() => removePeer(peer.id, peer.name)}>
				<FaIcon icon={faTrash} /><span class="hidden sm:inline">Remove</span>
			</button>
		{/if}
		{#if hasPeerAccess(peer, PeerAccess.ReadFullConfig, $userInfo$.wgnet?.peerAccess)}
			<Link class="btn btn-primary btn-sm text-sm" title="Export config" href={`/peers/${peer.id}/config`}><FaIcon icon={faFileExport} /><span class="hidden sm:inline">Export config</span></Link>
		{/if}
	</div>
	<PeerInfoBasic {peer} {canEdit} />
	<PeerInfoKey {peer} />
	<PeerInfoAddresses {peer} {canEdit} />
	<PeerInfoAllowedIPs {peer} {canEdit} />
	<PeerInfoEndpoints {peer} {canEdit} />
	<PeerInfoLinks {peer} />
	<PeerInfoTags {peer} />
</div>
