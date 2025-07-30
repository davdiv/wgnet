<script lang="ts">
	import { faRotateLeft, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerAllowedIp, StringifiedBinary } from "../../../node/database/types";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { cidrField } from "../../forms/cidrFieldLogic";
	import { fieldClass } from "../../forms/fieldClass";
	import { createForm, simpleField } from "../../forms/formLogic.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import { removePeerAllowedIp, upsertPeerAllowedIp } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	const { peer, allowedIp, canEdit }: { peer: PeerInfo; allowedIp: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">; canEdit: boolean } = $props();

	const remove = () => {
		removePeerAllowedIp({ peer: peer.id, ip: allowedIp.ip, netmask: allowedIp.netmask });
	};

	const checkDuplicateAllowedIp = (value: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">) => {
		const newIp = value.ip;
		const newNetmask = value.netmask;
		if ((newIp !== allowedIp.ip || newNetmask !== allowedIp.netmask) && peer.allowedIps.find(({ ip, netmask }) => ip === newIp && netmask === newNetmask)) {
			throw new Error(`Allowed IP ${newIp}/${newNetmask} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/allowedIPs/${allowedIp.ip}/${allowedIp.netmask}`);
	const form = createForm({
		get originalValue() {
			return allowedIp;
		},
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			const peerId = peer.id;
			const existingIp = allowedIp.ip;
			const existingNetmask = allowedIp.netmask;
			const newIp = value.ip;
			const newNetmask = value.netmask;
			await upsertPeerAllowedIp({ ...value, peer: peerId });
			if (existingIp != newIp || existingNetmask != newNetmask) {
				await removePeerAllowedIp({ peer: peerId, ip: existingIp, netmask: existingNetmask });
			}
		},
		fields: {
			cidr: { ...cidrField, validators: [checkDuplicateAllowedIp] },
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
				<button type="button" class="btn btn-sm btn-ghost" title="Remove" onclick={remove}><FaIcon icon={faTrash} /></button>
			</div>
		{/if}
	</FormContainer>
</div>
