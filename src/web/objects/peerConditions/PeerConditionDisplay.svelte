<script lang="ts">
	import PeerConditionItem from "./PeerConditionDisplayItem.svelte";

	export let peerCondition: string | null;

	$: parsedPeerCondition = peerCondition ? JSON.parse(peerCondition) : null;
</script>

{#if parsedPeerCondition}
	<PeerConditionItem value={parsedPeerCondition} />
{/if}
