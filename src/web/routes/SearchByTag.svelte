<script lang="ts">
	import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
	import Collapse from "../generic/Collapse.svelte";
	import FaIcon from "../generic/FaIcon.svelte";
	import Peers from "../lists/Peers.svelte";
	import PeerConditionDisplayItem from "../objects/peerConditions/PeerConditionDisplayItem.svelte";
	import PeerConditionEditItem from "../objects/peerConditions/PeerConditionEditItem.svelte";
	import type { Match } from "../router/matchPath";
	import { createSearchByTagLogic } from "./searchByTagLogic";

	export let match: Match;

	const { matchParams$, queryForEdition$, simplifiedQuery$, queryValidForSearch$, searchResult$ } = createSearchByTagLogic();

	$: matchParams$.set(match.params as any);
</script>

<div class="flex flex-col p-3 gap-2">
	<Collapse>
		<svelte:fragment slot="title">Query</svelte:fragment>
		<PeerConditionEditItem value$={queryForEdition$} />
	</Collapse>
	<Collapse>
		<svelte:fragment slot="title">Simplified query</svelte:fragment>
		{#if $simplifiedQuery$}
			<PeerConditionDisplayItem value={$simplifiedQuery$} />
		{:else}
			<span>There is no simplified query.</span>
		{/if}
	</Collapse>
	<Collapse>
		<svelte:fragment slot="title">JSON query</svelte:fragment>
		<textarea class="textarea-ghost p-3 font-mono" readonly>{JSON.stringify($queryForEdition$)}</textarea>
	</Collapse>
	<Collapse>
		<svelte:fragment slot="title">JSON simplified query</svelte:fragment>
		<textarea class="textarea-ghost p-3 font-mono" readonly>{JSON.stringify($simplifiedQuery$)}</textarea>
	</Collapse>
	<Collapse>
		<svelte:fragment slot="title">
			<span class="flex-none">Search results</span>
			<span class="badge badge-primary">{$searchResult$.length}</span>
		</svelte:fragment>
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
