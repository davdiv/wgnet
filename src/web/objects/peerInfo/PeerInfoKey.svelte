<script lang="ts">
	import { faEdit, faTrash, faWarning } from "@fortawesome/free-solid-svg-icons";
	import { PeerAccess, hasPeerAccess } from "../../../common/peerConditions/accessRights";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import { userInfo$ } from "../../data";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import EditKey from "../../generic/key/EditKey.svelte";
	import ShowKey from "../../generic/key/ShowKey.svelte";
	import { getPeerPrivateKey, setPeerPrivateKey, setPeerPublicKey } from "../../requests";
	import PeerKeyInfoIcon from "../PeerKeyInfoIcon.svelte";

	export let peer: PeerInfo;

	let editKeys: null | "public" | "private" = null;
	const editKeysClick = (newValue: null | "public" | "private", unused?: any) => {
		editKeys = newValue;
	};
	const saveKey = async (keyValue: string | null) => {
		if (editKeys === "public" || !keyValue) {
			await setPeerPublicKey(peer.id, keyValue, peer.name);
		} else if (editKeys === "private") {
			await setPeerPrivateKey(peer.id, keyValue, peer.name);
		}
		editKeysClick(null);
	};

	$: editKeysClick(null, peer);
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Key</span>
		<span class="badge badge-primary"><PeerKeyInfoIcon {peer} /></span>
	</svelte:fragment>
	{#if !editKeys}
		<div class="input input-ghost flex items-center gap-2">
			<span class="font-bold flex-none">Private key</span>
			{#key peer}
				<ShowKey
					retrieveSecret={hasPeerAccess(peer, PeerAccess.ReadPrivateKey, $userInfo$.wgnet?.peerAccess) ? () => getPeerPrivateKey(peer.id) : undefined}
					generateSecret={hasPeerAccess(peer, PeerAccess.WritePrivateKey, $userInfo$.wgnet?.peerAccess) ? () => setPeerPrivateKey(peer.id, null, peer.name) : undefined}
					hasSecret={!!peer.hasPrivateKey}
					editSecret={hasPeerAccess(peer, PeerAccess.WritePrivateKey, $userInfo$.wgnet?.peerAccess) ? () => editKeysClick("private") : undefined}
				/>
			{/key}
		</div>
		<div class="input input-ghost flex items-center gap-2">
			<span class="font-bold flex-none">Public key</span>
			<input type="text" class="w-full" value={peer.publicKey} readonly />
			{#if hasPeerAccess(peer, PeerAccess.WritePublicKey, $userInfo$.wgnet?.peerAccess)}
				<div class="join">
					<button type="button" class="btn btn-sm btn-ghost join-item" title="Remove key" on:click={() => setPeerPublicKey(peer.id, null, peer.name)}><FaIcon icon={faTrash} /></button>
					<button type="button" class="btn btn-sm btn-ghost join-item" title="Edit key" on:click={() => editKeysClick("public")}><FaIcon icon={faEdit} /></button>
				</div>
			{/if}
		</div>
	{:else}
		<div class="alert alert-warning mb-3">
			<FaIcon icon={faWarning} />
			{#if editKeys === "public"}
				Note that setting the public key also erases the private key.
			{:else}
				Note that setting the private key also sets the corresponding public key.
			{/if}
		</div>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="input input-ghost flex items-center gap-2">
			<span class="font-bold flex-none">{editKeys === "public" ? "Public key" : "Private key"}</span>
			<EditKey secret={editKeys === "private"} updateKey={saveKey} cancel={() => editKeysClick(null)} />
		</label>
	{/if}
</Collapse>
