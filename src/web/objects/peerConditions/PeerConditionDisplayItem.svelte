<script lang="ts">
	import { Operator, type PeerCondition } from "../../../common/peerConditions/evaluate";
	import Tag from "../../Tag.svelte";

	export let value: PeerCondition;
</script>

{#if typeof value === "number"}
	<Tag class="m-1" id={value} />
{:else if value.length === 1}
	<span class="mx-1">{value[0] === Operator.And ? "TRUE" : "FALSE"}</span>
{:else}
	<span class="border border-2 border-slate-300 m-1 inline-block">
		{#if value[0] === Operator.Not}
			<span class="mx-1">NOT</span>
		{/if}
		{#each value as operand, i}
			{#if i > 0}
				{#if i > 1}
					<span class="mx-1">{value[0] === Operator.And ? "AND" : "OR"}</span>
				{/if}
				<svelte:self value={operand} />
			{/if}
		{/each}
	</span>
{/if}
