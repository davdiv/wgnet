<script lang="ts">
	import { faTag } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "../generic/FaIcon.svelte";
	import ListItemLink from "../lists/ListItemLink.svelte";
	import PeerDisplay from "../objects/PeerDisplay.svelte";
	import TagDisplay from "../objects/TagDisplay.svelte";
	import { closeSuggestions, hasFocusDirective, navManagerDirective, showSuggestions$, suggestions$, text$ } from "./search";

	const itemClick = () => {
		closeSuggestions();
		$text$ = "";
	};
</script>

{#if $showSuggestions$}
	<div use:hasFocusDirective use:navManagerDirective class="fixed left-0 top-0 bottom-0 z-10 mt-16 bg-base-100 flex flex-col justify-items-stretch w-full overflow-y-auto">
		{#if $suggestions$.length > 0}
			{#each $suggestions$ as searchResult (searchResult)}
				{#if searchResult.type === "peer"}
					<ListItemLink href={`/peers/${searchResult.item.id}`} onclick={itemClick}>
						<PeerDisplay peer={searchResult.item} />
					</ListItemLink>
				{:else if searchResult.type === "tag"}
					<ListItemLink href={`/tags/${searchResult.item.id}`} onclick={itemClick}>
						<FaIcon icon={faTag} />
						<TagDisplay tag={searchResult.item} />
					</ListItemLink>
				{:else}
					<ListItemLink
						href={searchResult.item.href}
						title={searchResult.item.title}
						onclick={() => {
							itemClick();
							searchResult.item.handler?.();
						}}
					>
						<FaIcon icon={searchResult.item.icon} /><span>{searchResult.item.text}</span>
					</ListItemLink>
				{/if}
			{/each}
		{:else}
			<div>There is no search result!</div>
		{/if}
	</div>
{/if}
