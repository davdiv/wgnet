<script lang="ts">
	import { writable } from "@amadeus-it-group/tansu";
	import { faAdd, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { Operator, type PeerCondition } from "../../../common/peerConditions/evaluate";
	import type { DBTag } from "../../../node/database/types";
	import Tag from "../../Tag.svelte";
	import AutoComplete from "../../generic/AutoComplete.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import { searchTags, type ItemWithScore } from "../../search/search";
	import TagDisplay from "../TagDisplay.svelte";
	import { bindType } from "./utils";

	const selectTag = (tag: ItemWithScore<DBTag>) => {
		value$.set(tag.item.id);
	};
	const addItem = () => {
		value$.update((value) => {
			(value as any).push(-1);
			return value;
		});
	};
	const removeItem = (index: number) => {
		value$.update((value) => {
			(value as any).splice(index, 1);
			return value;
		});
	};

	export let value: PeerCondition;

	const value$ = writable(value);
	const fromModel = (value: PeerCondition) => ($value$ = value);
	const toModel = (newValue: PeerCondition) => (value = newValue);
	$: fromModel(value);
	$: toModel($value$);
	const type$ = bindType(value$);
</script>

<span class="border border-2 border-slate-300 m-1 inline-block">
	<select bind:value={$type$} class="select select-ghost select-sm m-2">
		<option value={null}>Tag</option>
		<option value={Operator.And}>AND</option>
		<option value={Operator.Or}>OR</option>
		<option value={Operator.Not}>NOT</option>
	</select>
	{#if typeof $value$ === "number"}
		{#if $value$ === -1}
			<AutoComplete placeholder="Search tag..." inputClass="input-sm m-2" getSuggestions={searchTags} selectSuggestion={selectTag} let:suggestion>
				<TagDisplay tag={suggestion.item} />
			</AutoComplete>
		{:else}
			<Tag id={$value$} />
			<button class="btn btn-ghost btn-sm" on:click={() => ($value$ = -1)}><FaIcon icon={faEdit} /></button>
		{/if}
	{:else}
		{#each $value$ as subitem, index}
			{#if index >= 1}
				<svelte:self bind:value={$value$[index]} />
				{#if $value$[0] != Operator.Not}
					<button type="button" class="btn btn-ghost btn-sm" on:click={() => removeItem(index)}><FaIcon icon={faTrash} /></button>
				{/if}
			{/if}
		{/each}
		{#if $value$[0] != Operator.Not}
			<button type="button" class="btn btn-ghost btn-sm" on:click={addItem}><FaIcon icon={faAdd} /></button>
		{/if}
	{/if}
</span>
