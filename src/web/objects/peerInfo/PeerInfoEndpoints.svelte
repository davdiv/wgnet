<script lang="ts">
	import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBPeerEndpoint } from "../../../node/database/types";
	import { fieldClass } from "../../forms/fieldClass";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { createForm, simpleField } from "../../forms/formLogic.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { upsertPeerEndpoint } from "../../requests";
	import PeerInfoEndpointItem from "./PeerInfoEndpointsItem.svelte";

	const { peer, canEdit }: { peer: PeerInfo; canEdit: boolean } = $props();

	const checkDuplicateEndpoint = (value: Omit<DBPeerEndpoint, "peer">) => {
		const newEndpoint = value.endpoint;
		if (peer.endpoints.find(({ endpoint }) => endpoint === newEndpoint)) {
			throw new Error(`Endpoint ${newEndpoint} already exists for this peer.`);
		}
	};

	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}#/endpoints`);
	const form = createForm({
		originalValue: { endpoint: "", priority: 1, peerCondition: null },
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		async submit(value) {
			await upsertPeerEndpoint({ ...value, peer: peer.id });
		},
		fields: {
			endpoint: { ...simpleField, validators: [checkDuplicateEndpoint] },
		},
	});
</script>

<Collapse>
	{#snippet title()}
		<span class="flex-none">Endpoints</span>
		<span class="badge badge-primary">{peer.endpoints.length}</span>
		{#if canEdit}
			<FormContainer {form}>
				<label class={["input w-full", fieldClass(form, "endpoint")]}>
					<input placeholder="Add endpoint" bind:value={form.fields.endpoint} />
					{#if form.changed}<button title="Clear field" type="button" class="btn btn-link btn-sm" onclick={form.reset}><FaIcon icon={faCircleXmark} /></button>{/if}
				</label>
			</FormContainer>
		{/if}
	{/snippet}
	{#if peer.endpoints.length > 0}
		<div class="flex flex-col">
			{#each peer.endpoints as endpoint (endpoint.endpoint)}
				<PeerInfoEndpointItem {peer} {endpoint} {canEdit} />
			{/each}
		</div>
	{:else}
		<div>This peer has no configured endpoint.</div>
	{/if}
</Collapse>
