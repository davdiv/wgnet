<script lang="ts">
	import { faRotateLeft, faUpload } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import Textarea from "../../generic/Textarea.svelte";
	import { updatePeer } from "../../requests";

	let peerEdit: Omit<PeerInfo, "tags" | "publicKey" | "hasPrivateKey">;
	const editPeer = ({ tags, publicKey, hasPrivateKey, ...peer }: PeerInfo) => {
		peerEdit = { ...peer };
	};
	export let peer: PeerInfo;
	export let canEdit: boolean;
	$: editPeer(peer);

	$: readonly = !canEdit;
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Basic properties</span>
	</svelte:fragment>
	<form
		class="contents"
		on:submit|preventDefault={() => {
			updatePeer(peerEdit);
		}}
	>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Name</span>
			<InputText class="w-full" bind:value={peerEdit.name} {readonly} />
		</label>
		<label class="input input-ghost w-full h-auto flex flex-col p-0">
			<span class="font-bold flex-none px-3 pb-1 self-start">Description</span>
			<Textarea placeholder="Empty description" class="w-full px-4 h-16 outline-0 bg-transparent" bind:value={peerEdit.description} {readonly} /></label
		>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Interface name</span>
			<InputText class="w-full" bind:value={peerEdit.interfaceName} placeholder="wg0" {readonly} />
		</label>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Listen port</span>
			<input type="number" class="w-full" bind:value={peerEdit.listenPort} placeholder="0" {readonly} />
		</label>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Firewall mark</span>
			<input type="number" class="w-full" bind:value={peerEdit.fwMark} placeholder="none" {readonly} />
		</label>
		{#if !readonly}
			<div class="flex gap-2 justify-end">
				<button type="submit" class="btn btn-sm btn-primary"><FaIcon icon={faUpload} />Save</button>
				<button
					type="button"
					class="btn btn-sm btn-secondary"
					on:click={() => {
						editPeer(peer);
					}}><FaIcon icon={faRotateLeft} />Reset</button
				>
			</div>
		{/if}
	</form>
</Collapse>
