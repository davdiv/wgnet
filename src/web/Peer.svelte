<script lang="ts">
	import { faServer } from "@fortawesome/free-solid-svg-icons";
	import type { HTMLAttributes } from "svelte/elements";
	import { allPeersMap$ } from "./data";
	import FaIcon from "./generic/FaIcon.svelte";

	const { id, ...rest }: { id: number } & Omit<HTMLAttributes<HTMLDivElement>, "id"> = $props();

	const peerInfo = $derived($allPeersMap$[id]);
</script>

<div {...rest} title={peerInfo?.description} class={["badge gap-2", rest.class]}>
	<FaIcon icon={faServer} />
	<span>
		{#if peerInfo}
			{peerInfo.name}
		{:else}
			{id}
		{/if}
	</span>
</div>
