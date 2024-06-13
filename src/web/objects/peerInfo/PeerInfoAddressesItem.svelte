<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerIp, StringifiedBinary } from "../../../node/database/types";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { removePeerIp } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	export let peer: PeerInfo;
	export let address: Omit<StringifiedBinary<DBPeerIp>, "peer">;
	export let canEdit: boolean;
</script>

<div class="flex items-center gap-2">
	<span>{address.ip}/{address.netmask}</span>
	{#if canEdit}
		<button type="button" class="btn btn-sm btn-ghost" on:click={() => removePeerIp({ peer: peer.id, ip: address.ip })}>
			<FaIcon icon={faTrash} />
		</button>
	{/if}
	<PeerConditionDisplay peerCondition={address.peerCondition} />
</div>
