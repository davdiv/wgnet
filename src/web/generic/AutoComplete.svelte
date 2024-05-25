<script lang="ts">
	import { createAutoCompleteLogic } from "./autoCompleteLogic";

	type Item = $$Generic; // eslint-disable-line no-undef
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type $$Slots = {
		default: { suggestion: Item };
	};
	const { closeSuggestions, getSuggestions$, inputDirective, hasFocusDirective, navManagerDirective, text$, showSuggestions$, suggestions$ } = createAutoCompleteLogic<Item>();

	export let getSuggestions: (trimmedText: string) => Item[];
	export let selectSuggestion: (suggestion: Item) => void;
	export let inputClass = "";

	$: $getSuggestions$ = getSuggestions;
</script>

<div class="dropdown dropdown-bottom {$$restProps.class ?? ''}">
	<div class="input input-ghost flex gap-2 {inputClass}">
		<input {...$$restProps} class="w-full" bind:value={$text$} use:hasFocusDirective use:navManagerDirective use:inputDirective />
	</div>
	{#if $showSuggestions$}
		<ul class="dropdown-content z-10 menu my-2 border p-2 shadow bg-base-100 rounded-box w-full" use:hasFocusDirective use:navManagerDirective>
			{#if $suggestions$.length > 0}
				{#each $suggestions$ as suggestion}
					<li>
						<button
							type="button"
							on:click={() => {
								closeSuggestions();
								$text$ = "";
								selectSuggestion(suggestion);
							}}><slot {suggestion}>{suggestion}</slot></button
						>
					</li>
				{/each}
			{:else}
				<li>There is no suggestion!</li>
			{/if}
		</ul>
	{/if}
</div>
