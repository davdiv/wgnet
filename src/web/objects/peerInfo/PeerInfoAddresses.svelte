<script lang="ts">
	import { formatIP, parseIPCIDR } from "../../../common/ip";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import Collapse from "../../generic/Collapse.svelte";
	import { addPeerIp } from "../../requests";
	import { ToastType, addToast } from "../../toasts/toasts";
	import PeerInfoAddressesItem from "./PeerInfoAddressesItem.svelte";

	export let peer: PeerInfo;
	export let canEdit: boolean;

	let newAddress = "";
	const addAddress = async () => {
		let cidr;
		try {
			cidr = parseIPCIDR(newAddress);
		} catch {
			addToast(`Invalid CIDR: ${newAddress}`, ToastType.error);
			return;
		}
		await addPeerIp({ peer: peer.id, ip: formatIP(cidr[0]), netmask: cidr[1], peerCondition: null });
		newAddress = "";
	};
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Addresses</span>
		<span class="badge badge-primary">{peer.addresses.length}</span>
		{#if canEdit}
			<form class="contents" on:submit|preventDefault={addAddress}><input class="input input-ghost w-full" placeholder="Add CIDR" bind:value={newAddress} /></form>
		{/if}
	</svelte:fragment>
	{#if peer.addresses.length > 0}
		<div class="flex flex-col">
			{#each peer.addresses as address (address)}
				<PeerInfoAddressesItem {peer} {address} {canEdit} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured address.</div>
	{/if}
</Collapse>
