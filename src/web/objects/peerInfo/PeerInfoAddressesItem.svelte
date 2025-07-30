<script lang="ts">
	import { faRotateLeft, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerIp, StringifiedBinary } from "../../../node/database/types";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { cidrField } from "../../forms/cidrFieldLogic";
	import { fieldClass } from "../../forms/fieldClass";
	import { createForm, simpleField } from "../../forms/formLogic.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import { removePeerIp, upsertPeerIp } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	const { peer, address, canEdit }: { peer: PeerInfo; address: Omit<StringifiedBinary<DBPeerIp>, "peer">; canEdit: boolean } = $props();

	const remove = () => {
		removePeerIp({ peer: peer.id, ip: address.ip });
	};

	const checkDuplicateIp = (value: Omit<StringifiedBinary<DBPeerIp>, "peer">) => {
		const newIp = value.ip;
		if (newIp !== address.ip && peer.addresses.find(({ ip }) => ip === newIp)) {
			throw new Error(`IP ${newIp} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/addresses/${address.ip}`);
	const form = createForm({
		get originalValue() {
			return address;
		},
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			const peerId = peer.id;
			const existingIp = address.ip;
			const newIp = value.ip;
			await upsertPeerIp({ ...value, peer: peerId });
			if (existingIp != newIp) {
				await removePeerIp({ peer: peerId, ip: existingIp });
			}
		},
		fields: {
			cidr: { ...cidrField, validators: [checkDuplicateIp] },
			peerCondition: simpleField,
		},
	});
</script>

<div class="flex items-center gap-2">
	<FormContainer {form}>
		<InputText class={["input", fieldClass(form, "cidr")]} bind:value={form.fields.cidr} {readonly} />
		<PeerConditionDisplay peerCondition={form.fields.peerCondition} />
		{#if canEdit}
			<div class="join">
				{#if form.changed}
					<button type="submit" class="join-item btn btn-sm btn-ghost" title="Save change"><FaIcon icon={faUpload} /></button>
					<button type="button" class="join-item btn btn-sm btn-ghost" title="Reset change" onclick={form.reset}><FaIcon icon={faRotateLeft} /></button>
				{/if}
				<button type="button" class="join-item btn btn-sm btn-ghost" title="Remove" onclick={remove}><FaIcon icon={faTrash} /></button>
			</div>
		{/if}
	</FormContainer>
</div>
