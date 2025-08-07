<script lang="ts">
	import { type WritableSignal } from "@amadeus-it-group/tansu";
	import { faAdd, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { ComposedConditionType, SimpleConditionType, isPeerIdCondition, isTagCondition, type PeerCondition } from "../../../common/peerConditions/evaluate";
	import type { PeerInfo } from "../../../node/database/requests/getAllPeers";
	import type { DBTag } from "../../../node/database/types";
	import Peer from "../../Peer.svelte";
	import Tag from "../../Tag.svelte";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { searchPeers, searchTags, type ItemWithScore } from "../../search/search";
	import PeerDisplay from "../PeerDisplay.svelte";
	import TagDisplay from "../TagDisplay.svelte";
	import PeerConditionEditItem from "./PeerConditionEditItem.svelte";
	import PeerConditionType from "./PeerConditionType.svelte";
	import { itemWritable } from "./utils";

	const selectTag = (tag: ItemWithScore<DBTag>) => {
		value$.set([SimpleConditionType.Tag, tag.item.id]);
	};
	const selectPeer = (peer: ItemWithScore<PeerInfo>) => {
		value$.set([SimpleConditionType.PeerId, peer.item.id]);
	};
	const addItem = () => {
		value$.update((value) => {
			(value as any).push([SimpleConditionType.Tag, -1]);
			return value;
		});
	};
	const removeItem = (index: number) => {
		value$.update((value) => {
			(value as any).splice(index, 1);
			return value;
		});
	};

	const { value$ }: { value$: WritableSignal<PeerCondition> } = $props();
</script>

<span class="border border-2 border-slate-300 m-1 inline-block">
	<PeerConditionType {value$} />

	{#if isTagCondition($value$)}
		{#if $value$[1] === -1}
			<AutoComplete placeholder="Search tag..." inputClass="input-sm m-2" getSuggestions={searchTags} selectSuggestion={selectTag}>
				{#snippet children({ suggestion })}
					<TagDisplay tag={suggestion.item} />
				{/snippet}
			</AutoComplete>
		{:else}
			<Tag id={$value$[1]} />
			<button class="btn btn-ghost btn-sm" onclick={() => ($value$ = [SimpleConditionType.Tag, -1])}><FaIcon icon={faEdit} /></button>
		{/if}
	{:else if isPeerIdCondition($value$)}
		{#if $value$[1] === -1}
			<AutoComplete placeholder="Search peer..." inputClass="input-sm m-2" getSuggestions={searchPeers} selectSuggestion={selectPeer}>
				{#snippet children({ suggestion })}
					<PeerDisplay peer={suggestion.item} />
				{/snippet}
			</AutoComplete>
		{:else}
			<Peer id={$value$[1]} />
			<button class="btn btn-ghost btn-sm" onclick={() => ($value$ = [SimpleConditionType.PeerId, -1])}><FaIcon icon={faEdit} /></button>
		{/if}
	{:else}
		{#each $value$ as subitem, index (subitem)}
			{#if index >= 1}
				<PeerConditionEditItem value$={itemWritable(value$, index)} />
				{#if $value$[0] != ComposedConditionType.Not}
					<button type="button" class="btn btn-ghost btn-sm" onclick={() => removeItem(index)}><FaIcon icon={faTrash} /></button>
				{/if}
			{/if}
		{/each}
		{#if $value$[0] != ComposedConditionType.Not}
			<button type="button" class="btn btn-ghost btn-sm" onclick={addItem}><FaIcon icon={faAdd} /></button>
		{/if}
	{/if}
</span>
