<script lang="ts">
	import PeerConditionItem from "./PeerConditionDisplayItem.svelte";

	const { peerCondition }: { peerCondition: string | null } = $props();

	const parsedPeerCondition = $derived(peerCondition ? JSON.parse(peerCondition) : null);
</script>

{#if parsedPeerCondition}
	<PeerConditionItem value={parsedPeerCondition} />
{/if}
