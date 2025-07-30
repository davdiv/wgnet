<script lang="ts">
	import { faAdd, faDiagramProject, faSearch, faServer, faTag, faTags } from "@fortawesome/free-solid-svg-icons";
	import { PeerAccess, hasPeerAccess } from "../../common/peerConditions/accessRights";
	import { userInfo$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { createListNavigation } from "../lists/listNavigation";
	import { addPeer, addTag } from "../requests";
	import Link from "../router/Link.svelte";

	const listNavigation = createListNavigation("a,input");

	let peerName = "";
	let tagName = "";

	const onPeerSubmit = async () => {
		await addPeer(peerName, $userInfo$.wgnet?.peerDefaultTags ?? []);
	};

	const onTagSubmit = async () => {
		await addTag(tagName);
	};
</script>

<div class="hero bg-base-200 -mt-16 pt-16 min-h-dvh">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold">wgnet</h1>
			<p class="py-6">wgnet helps you manage your Wireguard network.</p>
			<div class="flex flex-col gap-2" use:listNavigation>
				{#if hasPeerAccess({ tags: $userInfo$.wgnet?.peerDefaultTags ?? [], id: -1 }, PeerAccess.CreateDelete, $userInfo$.wgnet?.peerAccess)}
					<form class="flex gap-2 input input-ghost w-full items-center" on:submit|preventDefault={onPeerSubmit}>
						<FaIcon class="flex-none" icon={faServer} /><input placeholder="Peer name" class="flex-1 w-full" bind:value={peerName} />
						<button type="submit" class="btn btn-sm btn-ghost flex-none" title="Create a peer"><FaIcon icon={faAdd} /></button>
					</form>
				{/if}
				{#if $userInfo$.wgnet?.tagsAdmin}
					<form class="flex gap-2 input input-ghost w-full items-center" on:submit|preventDefault={onTagSubmit}>
						<FaIcon class="flex-none" icon={faTag} /><input placeholder="Tag name" class="flex-1 w-full" bind:value={tagName} />
						<button type="submit" class="btn btn-sm btn-ghost flex-none" title="Create a tag"><FaIcon icon={faAdd} /></button>
					</form>
				{/if}
				<Link href="/network" class="btn btn-ghost"><FaIcon icon={faDiagramProject} />Network</Link>
				<Link href="/peers" class="btn btn-ghost"><FaIcon icon={faServer} />Peers</Link>
				<Link href="/tags" class="btn btn-ghost"><FaIcon icon={faTags} />Tags</Link>
				<Link href="/search" class="btn btn-ghost"><FaIcon icon={faSearch} />Search</Link>
			</div>
		</div>
	</div>
</div>
