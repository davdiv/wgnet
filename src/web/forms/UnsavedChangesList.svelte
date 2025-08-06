<script lang="ts">
	import { SvelteSet } from "svelte/reactivity";
	import ListItemLink from "../lists/ListItemLink.svelte";
	import Peer from "../Peer.svelte";
	import Tag from "../Tag.svelte";
	import { formsData } from "./formData.svelte";

	import { closePopup, hasFocusDirective, navDirective, showPopup$ } from "./unsavedChangesLogic";
	import FaIcon from "../generic/FaIcon.svelte";
	import { faRotateLeft } from "@fortawesome/free-solid-svg-icons";

	const urls = $derived.by(() => {
		const result = new SvelteSet<string>();
		for (const url of formsData.keys()) {
			result.add(url.split("#", 1)[0]);
		}
		return result;
	});

	const removeChanges = (urlToRemove: string) => {
		for (const url of formsData.keys()) {
			if (urlToRemove === url.split("#", 1)[0]) {
				formsData.delete(url);
			}
		}
	};
</script>

{#if $showPopup$}
	<div use:hasFocusDirective use:navDirective class="fixed left-0 top-0 bottom-0 z-10 mt-16 bg-base-100 flex flex-col justify-items-stretch w-full overflow-y-auto">
		{#each urls as url (url)}
			<ListItemLink href={url} onClick={closePopup}>
				{#if url.startsWith("/peers/")}
					<Peer id={+url.split("/")[2]} />
				{:else if url.startsWith("/tags/")}
					<Tag id={+url.split("/")[2]} />
				{:else}
					{url}
				{/if}
				{#snippet actions()}
					<button type="button" class="btn btn-sm btn-ghost me-3" title="Reset changes" onclick={() => removeChanges(url)}><FaIcon icon={faRotateLeft} /></button>
				{/snippet}
			</ListItemLink>
		{/each}
	</div>
{/if}
