<script lang="ts">
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerAllowedIp, StringifiedBinary } from "../../../node/database/types";
	import { cidrField } from "../../forms/cidrFieldLogic";
	import { fieldClass } from "../../forms/fieldClass";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { createForm } from "../../forms/formLogic.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import { upsertPeerAllowedIp } from "../../requests";
	import PeerInfoAllowedIPsItem from "./PeerInfoAllowedIPsItem.svelte";

	const { peer, canEdit }: { peer: PeerInfo; canEdit: boolean } = $props();

	const checkDuplicateAllowedIp = (value: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">) => {
		const newIp = value.ip;
		const newNetmask = value.netmask;
		if (peer.allowedIps.find(({ ip, netmask }) => ip === newIp && netmask === newNetmask)) {
			throw new Error(`Allowed IP ${newIp}/${newNetmask} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/allowedIPs`);
	const form = createForm({
		originalValue: { ip: "", netmask: NaN, peerCondition: null },
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			await upsertPeerAllowedIp({ ...value, peer: peer.id });
		},
		fields: {
			cidr: { ...cidrField, validators: [checkDuplicateAllowedIp] },
		},
	});
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Allowed IPs</span>
		<span class="badge badge-primary">{peer.allowedIps.length}</span>
		{#if canEdit}
			<FormContainer {form}><input class={["input w-full", fieldClass(form, "cidr")]} bind:value={form.fields.cidr} placeholder="Add CIDR" /></FormContainer>
		{/if}
	</svelte:fragment>
	{#if peer.allowedIps.length > 0}
		<div class="flex flex-col">
			{#each peer.allowedIps as allowedIp (`${allowedIp.ip}/${allowedIp.netmask}`)}
				<PeerInfoAllowedIPsItem {peer} {allowedIp} {canEdit} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured allowed IP.</div>
	{/if}
</Collapse>
