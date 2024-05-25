<script lang="ts">
	import { faServer } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../node/database/requests/getAllPeers";
	import FaIcon from "../generic/FaIcon.svelte";
	import Tag from "../Tag.svelte";
	import PeerKeyInfoIcon from "./PeerKeyInfoIcon.svelte";

	export let peer: PeerInfo;
</script>

<FaIcon icon={faServer} />{peer.name}<PeerKeyInfoIcon {peer} />
{#each peer.tags as tag (tag)}<Tag id={tag} />{/each}
{#each peer.addresses as address}<span>{address.ip}</span>{/each}
