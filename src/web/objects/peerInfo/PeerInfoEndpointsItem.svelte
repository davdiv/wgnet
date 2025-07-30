<script lang="ts">
	import { faRotateLeft, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerEndpoint } from "../../../node/database/types";
	import { fieldClass } from "../../forms/fieldClass";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { createForm, type FieldDefinition, simpleField } from "../../forms/formLogic.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import { removePeerEndpoint, upsertPeerEndpoint } from "../../requests";
	import PeerConditionDisplay from "../peerConditions/PeerConditionDisplay.svelte";

	const { peer, endpoint, canEdit }: { peer: PeerInfo; endpoint: Omit<DBPeerEndpoint, "peer">; canEdit: boolean } = $props();

	const remove = () => {
		removePeerEndpoint({ peer: peer.id, endpoint: endpoint.endpoint });
	};

	const checkDuplicateEndpoint = (value: Omit<DBPeerEndpoint, "peer">) => {
		const newEndpoint = value.endpoint;
		if (newEndpoint !== endpoint.endpoint && peer.endpoints.find(({ endpoint }) => endpoint === newEndpoint)) {
			throw new Error(`Endpoint ${newEndpoint} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/endpoints/${endpoint.endpoint}`);
	const form = createForm({
		get originalValue() {
			return endpoint;
		},
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			const peerId = peer.id;
			const oldEndpoint = endpoint.endpoint;
			const newEndpoint = value.endpoint;
			await upsertPeerEndpoint({ ...value, peer: peerId });
			if (newEndpoint !== oldEndpoint) {
				await removePeerEndpoint({ peer: peerId, endpoint: oldEndpoint });
			}
		},
		fields: {
			endpoint: { ...simpleField, validators: [checkDuplicateEndpoint] },
			priority: simpleField as any as FieldDefinition<any, number>,
			peerCondition: simpleField,
		},
	});
</script>

<div class="flex items-center gap-2">
	<FormContainer {form}>
		<InputText class={["input", fieldClass(form, "endpoint")]} bind:value={form.fields.endpoint} {readonly} />
		<input type="number" class={["input", fieldClass(form, "priority")]} bind:value={form.fields.priority} placeholder="none" {readonly} />
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
