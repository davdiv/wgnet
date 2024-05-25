<script lang="ts">
	import { formatIP, parseIPCIDR } from "../../../common/ip";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import Collapse from "../../generic/Collapse.svelte";
	import { addPeerAllowedIp } from "../../requests";
	import { ToastType, addToast } from "../../toasts/toasts";
	import PeerInfoAllowedIPsItem from "./PeerInfoAllowedIPsItem.svelte";

	export let peer: PeerInfo;

	let newAllowedIP = "";
	const addAllowedIP = async () => {
		let cidr;
		try {
			cidr = parseIPCIDR(newAllowedIP);
		} catch (error) {
			addToast(`Invalid CIDR: ${newAllowedIP}`, ToastType.error);
			return;
		}
		await addPeerAllowedIp({ peer: peer.id, ip: formatIP(cidr[0]), netmask: cidr[1], peerCondition: null });
		newAllowedIP = "";
	};
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Allowed IPs</span>
		<span class="badge badge-primary">{peer.allowedIps.length}</span>
		<form class="contents" on:submit|preventDefault={addAllowedIP}><input class="input input-ghost w-full" bind:value={newAllowedIP} placeholder="Add CIDR" /></form>
	</svelte:fragment>
	{#if peer.allowedIps.length > 0}
		<div class="flex flex-col">
			{#each peer.allowedIps as allowedIp}
				<PeerInfoAllowedIPsItem {peer} {allowedIp} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured allowed IP.</div>
	{/if}
</Collapse>
