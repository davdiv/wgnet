<script lang="ts">
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import Collapse from "../generic/Collapse.svelte";
	import FaIcon from "../generic/FaIcon.svelte";
	import Peers from "../lists/Peers.svelte";
	import PeerConditionDisplayItem from "../objects/peerConditions/PeerConditionDisplayItem.svelte";
	import PeerConditionEditItem from "../objects/peerConditions/PeerConditionEditItem.svelte";
	import type { Match } from "../router/matchPath";
	import { createSearchLogic } from "./searchLogic";

	const { match }: { match: Match } = $props();

	const { matchParams$, queryForEdition$, simplifiedQuery$, queryValidForSearch$, searchResult$ } = createSearchLogic();

	const updateMatchParams = () => {
		$matchParams$ = match.params as any;
	};
	updateMatchParams();
	$effect.pre(updateMatchParams);
</script>

<div class="flex flex-col p-3 gap-2">
	<Collapse>
		{#snippet title()}Query{/snippet}
		<PeerConditionEditItem value$={queryForEdition$} />
	</Collapse>
	<Collapse>
		{#snippet title()}Simplified query{/snippet}
		{#if $simplifiedQuery$}
			<PeerConditionDisplayItem value={$simplifiedQuery$} />
		{:else}
			<span>There is no simplified query.</span>
		{/if}
	</Collapse>
	<Collapse>
		{#snippet title()}JSON query{/snippet}
		<textarea class="textarea-ghost p-3 font-mono" readonly>{JSON.stringify($queryForEdition$)}</textarea>
	</Collapse>
	<Collapse>
		{#snippet title()}JSON simplified query{/snippet}
		<textarea class="textarea-ghost p-3 font-mono" readonly>{JSON.stringify($simplifiedQuery$)}</textarea>
	</Collapse>
	<Collapse>
		{#snippet title()}
			<span class="flex-none">Search results</span>
			<span class="badge badge-primary">{$searchResult$.length}</span>
		{/snippet}
		{#if $searchResult$.length > 0}
			<Peers peers={$searchResult$} />
		{:else if !$queryValidForSearch$}
			<div class="alert alert-info">
				<FaIcon icon={faInfoCircle} />
				<span>Please complete the query, then search results will be displayed here.</span>
			</div>
		{:else}
			<div>There is no peer matching the query.</div>
		{/if}
	</Collapse>
</div>
