<script lang="ts">
	import { faServer } from "@fortawesome/free-solid-svg-icons";
	import { allPeersMap$ } from "./data";
	import FaIcon from "./generic/FaIcon.svelte";

	export let id: number;

	$: peerInfo = $allPeersMap$[id];
</script>

<div title={peerInfo?.description} {...$$restProps} class="badge gap-2 {$$restProps.class}">
	<FaIcon icon={faServer} />
	<span>
		{#if peerInfo}
			{peerInfo.name}
		{:else}
			{id}
		{/if}
	</span>
</div>
