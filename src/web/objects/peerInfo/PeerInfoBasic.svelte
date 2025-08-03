<script lang="ts">
	import { faRotateLeft, faUpload } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { createForm, simpleField } from "../../forms/formLogic.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import Textarea from "../../generic/Textarea.svelte";
	import { updatePeer } from "../../requests";
	import { fieldClass } from "../../forms/fieldClass";

	const { peer, canEdit }: { peer: PeerInfo; canEdit: boolean } = $props();
	const peerCopy = $derived.by(() => {
		const { id, name, description, interfaceName, listenPort, fwMark } = peer;
		return { id, name, description, interfaceName, listenPort, fwMark };
	});
	const readonly = $derived(!canEdit);
	const formHref = $derived(`/peers/${peer.id}`);
	const form = createForm({
		get originalValue() {
			return peerCopy;
		},
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		submit: updatePeer,
		fields: {
			name: simpleField,
			description: simpleField,
			interfaceName: simpleField,
			listenPort: simpleField,
			fwMark: simpleField,
		},
	});
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Basic properties</span>
	</svelte:fragment>
	<FormContainer {form}>
		<label class={["input w-full flex items-center gap-2", fieldClass(form, "name")]}>
			<span class="font-bold flex-none">Name</span>
			<InputText class="w-full" bind:value={form.fields.name} {readonly} />
		</label>
		<label class={["input w-full h-auto flex flex-col p-0", fieldClass(form, "description")]}>
			<span class="font-bold flex-none px-3 pb-1 self-start">Description</span>
			<Textarea placeholder="Empty description" class="w-full px-4 h-16 outline-0 bg-transparent" bind:value={form.fields.description} {readonly} /></label
		>
		<label class={["input w-full flex items-center gap-2", fieldClass(form, "interfaceName")]}>
			<span class="font-bold flex-none">Interface name</span>
			<InputText class="w-full" bind:value={form.fields.interfaceName} placeholder="wg0" {readonly} />
		</label>
		<label class={["input w-full flex items-center gap-2", fieldClass(form, "listenPort")]}>
			<span class="font-bold flex-none">Listen port</span>
			<input type="number" class="w-full" bind:value={form.fields.listenPort} placeholder="0" {readonly} />
		</label>
		<label class={["input w-full flex items-center gap-2", fieldClass(form, "fwMark")]}>
			<span class="font-bold flex-none">Firewall mark</span>
			<input type="number" class="w-full" bind:value={form.fields.fwMark} placeholder="none" {readonly} />
		</label>
		{#if !readonly && form.changed}
			<div class="flex gap-2 justify-end">
				<button type="submit" class="btn btn-sm btn-primary"><FaIcon icon={faUpload} />Save</button>
				<button type="button" class="btn btn-sm btn-secondary" onclick={form.reset}><FaIcon icon={faRotateLeft} />Reset</button>
			</div>
		{/if}
	</FormContainer>
</Collapse>
