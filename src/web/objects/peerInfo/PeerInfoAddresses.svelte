<script lang="ts">
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerIp, StringifiedBinary } from "../../../node/database/types";
	import { cidrField } from "../../forms/cidrFieldLogic";
	import { fieldClass } from "../../forms/fieldClass";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { createForm } from "../../forms/formLogic.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import { upsertPeerIp } from "../../requests";
	import PeerInfoAddressesItem from "./PeerInfoAddressesItem.svelte";

	const { peer, canEdit }: { peer: PeerInfo; canEdit: boolean } = $props();

	const checkDuplicateIp = (value: Omit<StringifiedBinary<DBPeerIp>, "peer">) => {
		const newIp = value.ip;
		if (peer.addresses.find(({ ip }) => ip === newIp)) {
			throw new Error(`IP ${newIp} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/addresses`);
	const form = createForm({
		originalValue: { ip: "", netmask: NaN, peerCondition: null },
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			await upsertPeerIp({ ...value, peer: peer.id });
		},
		fields: {
			cidr: { ...cidrField, validators: [checkDuplicateIp] },
		},
	});
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Addresses</span>
		<span class="badge badge-primary">{peer.addresses.length}</span>
		{#if canEdit}
			<FormContainer {form}><input class={["input w-full", fieldClass(form, "cidr")]} placeholder="Add CIDR" bind:value={form.fields.cidr} /></FormContainer>
		{/if}
	</svelte:fragment>
	{#if peer.addresses.length > 0}
		<div class="flex flex-col">
			{#each peer.addresses as address (address.ip)}
				<PeerInfoAddressesItem {peer} {address} {canEdit} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured address.</div>
	{/if}
</Collapse>
