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

	export let peer: PeerInfo;
</script>

<div class="flex flex-col p-3 gap-2">
	<div class="flex gap-2 text-xl font-bold items-center">
		<FaIcon icon={faServer} /><span class="grow">{peer.name}</span>
		<button type="button" class="btn btn-sm btn-error" title="Remove peer" on:click={() => removePeer(peer.id, peer.name)}><FaIcon icon={faTrash} /><span class="hidden sm:inline">Remove</span></button
		>
		<Link class="btn btn-primary btn-sm text-sm" title="Export config" href={`/peers/${peer.id}/config`}><FaIcon icon={faFileExport} /><span class="hidden sm:inline">Export config</span></Link>
	</div>
	<PeerInfoBasic {peer} />
	<PeerInfoKey {peer} />
	<PeerInfoAddresses {peer} />
	<PeerInfoAllowedIPs {peer} />
	<PeerInfoEndpoints {peer} />
	<PeerInfoLinks {peer} />
	<PeerInfoTags {peer} />
</div>
