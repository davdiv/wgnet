<script lang="ts" generics="Item">
	import type { Snippet } from "svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { createAutoCompleteLogic } from "./autoCompleteLogic";

	const {
		getSuggestions,
		selectSuggestion,
		inputClass = "",
		class: divClass,
		children,
		...restProps
	}: {
		getSuggestions: (trimmedText: string) => Item[];
		selectSuggestion: (suggestion: Item) => void;
		children: Snippet<[{ suggestion: Item }]>;
		inputClass?: string;
	} & Omit<HTMLInputAttributes, "children"> = $props();

	const { closeSuggestions, getSuggestions$, inputDirective, hasFocusDirective, navManagerDirective, text$, showSuggestions$, suggestions$ } = createAutoCompleteLogic<Item>();

	const updateGetSuggestions = () => {
		$getSuggestions$ = getSuggestions;
	};
	updateGetSuggestions();
	$effect.pre(updateGetSuggestions);
</script>

<div class={["dropdown dropdown-bottom", divClass]}>
	<div class="input input-ghost w-full flex gap-2 {inputClass}">
		<input {...restProps} class="w-full" bind:value={$text$} use:hasFocusDirective use:navManagerDirective use:inputDirective />
	</div>
	{#if $showSuggestions$}
		<ul class="dropdown-content z-10 menu my-2 border p-2 shadow bg-base-100 rounded-box w-full" use:hasFocusDirective use:navManagerDirective>
			{#if $suggestions$.length > 0}
				{#each $suggestions$ as suggestion (suggestion)}
					<li>
						<button
							type="button"
							onclick={() => {
								closeSuggestions();
								$text$ = "";
								selectSuggestion(suggestion);
							}}>{@render children({ suggestion })}</button
						>
					</li>
				{/each}
			{:else}
				<li>There is no suggestion!</li>
			{/if}
		</ul>
	{/if}
</div>
