<script lang="ts">
	import { ComposedConditionType, isPeerIdCondition, isTagCondition, type PeerCondition } from "../../../common/peerConditions/evaluate";
	import Peer from "../../Peer.svelte";
	import Tag from "../../Tag.svelte";
	import PeerConditionDisplayItem from "./PeerConditionDisplayItem.svelte";

	const { value }: { value: PeerCondition } = $props();
</script>

{#if isTagCondition(value)}
	<Tag class="m-1" id={value[1]} />
{:else if isPeerIdCondition(value)}
	<Peer class="m-1" id={value[1]} />
{:else if value.length === 1}
	<span class="mx-1">{value[0] === ComposedConditionType.And ? "TRUE" : "FALSE"}</span>
{:else}
	<span class="border border-2 border-slate-300 m-1 inline-block">
		{#if value[0] === ComposedConditionType.Not}
			<span class="mx-1">NOT</span>
		{/if}
		{#each value as operand, i (operand)}
			{#if i > 0}
				{#if i > 1}
					<span class="mx-1">{value[0] === ComposedConditionType.And ? "AND" : "OR"}</span>
				{/if}
				<PeerConditionDisplayItem value={operand as PeerCondition} />
			{/if}
		{/each}
	</span>
{/if}
