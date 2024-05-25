<script lang="ts">
	import { faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerEndpoint } from "../../../node/database/types";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { removePeerEndpoint } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	export let peer: PeerInfo;
	export let endpoint: Omit<DBPeerEndpoint, "peer">;
</script>

<div class="flex items-center gap-2">
	<span>{endpoint.endpoint}</span>
	<button type="button" class="btn btn-sm btn-ghost" on:click={() => removePeerEndpoint({ peer: peer.id, endpoint: endpoint.endpoint })}><FaIcon icon={faTrash} /></button>
	<span>{endpoint.priority}</span>
	<PeerConditionDisplay peerCondition={endpoint.peerCondition} />
</div>
