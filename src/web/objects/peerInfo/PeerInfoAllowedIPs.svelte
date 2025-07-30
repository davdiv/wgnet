<script lang="ts">
	import { formatIP, parseIPCIDR } from "../../../common/ip";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import Collapse from "../../generic/Collapse.svelte";
	import { upsertPeerAllowedIp } from "../../requests";
	import { ToastType, addToast } from "../../toasts/toasts";
	import PeerInfoAllowedIPsItem from "./PeerInfoAllowedIPsItem.svelte";

	export let peer: PeerInfo;
	export let canEdit: boolean;

	let newAllowedIP = "";
	const addAllowedIP = async () => {
		let cidr;
		try {
			cidr = parseIPCIDR(newAllowedIP);
		} catch {
			addToast(`Invalid CIDR: ${newAllowedIP}`, ToastType.error);
			return;
		}
		await upsertPeerAllowedIp({ peer: peer.id, ip: formatIP(cidr[0]), netmask: cidr[1], peerCondition: null });
		newAllowedIP = "";
	};
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Allowed IPs</span>
		<span class="badge badge-primary">{peer.allowedIps.length}</span>
		{#if canEdit}
			<form class="contents" on:submit|preventDefault={addAllowedIP}><input class="input input-ghost w-full" bind:value={newAllowedIP} placeholder="Add CIDR" /></form>
		{/if}
	</svelte:fragment>
	{#if peer.allowedIps.length > 0}
		<div class="flex flex-col">
			{#each peer.allowedIps as allowedIp (allowedIp)}
				<PeerInfoAllowedIPsItem {peer} {allowedIp} {canEdit} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured allowed IP.</div>
	{/if}
</Collapse>
