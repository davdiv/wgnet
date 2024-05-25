<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerAllowedIp, StringifiedBinary } from "../../../node/database/types";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { removePeerAllowedIp } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	export let peer: PeerInfo;
	export let allowedIp: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">;
</script>

<div class="flex items-center gap-2">
	<span>{allowedIp.ip}/{allowedIp.netmask}</span>
	<PeerConditionDisplay peerCondition={allowedIp.peerCondition} />
	<button type="button" class="btn btn-sm btn-ghost" on:click={() => removePeerAllowedIp({ peer: peer.id, ip: allowedIp.ip, netmask: allowedIp.netmask })}>
		<FaIcon icon={faTrash} />
	</button>
</div>
