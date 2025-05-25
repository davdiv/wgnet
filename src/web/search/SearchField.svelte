<script lang="ts">
	import { getKeyName } from "@agnos-ui/core/services/navManager";
	import { faSearch } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "../generic/FaIcon.svelte";
	import { hasFocusDirective, inputDirective, navManagerDirective, text$ } from "./search";

	let input: HTMLInputElement;
	const generalKeydown = (event: KeyboardEvent) => {
		const keyName = getKeyName(event);
		if (keyName === "Ctrl+k") {
			input?.focus();
			event.preventDefault();
		}
	};
</script>

<svelte:window on:keydown={generalKeydown} />
<label class="flex-1 flex gap-2 input input-ghost w-full min-w-1 mx-2" use:hasFocusDirective>
	<FaIcon class="flex-none hidden sm:block" icon={faSearch} />
	<input bind:this={input} class="flex-1 w-full" bind:value={$text$} use:inputDirective type="text" placeholder="Search" use:navManagerDirective />
	<span class="flex-none hidden sm:block">
		<kbd class="kbd kbd-sm">Ctrl</kbd>
		<kbd class="kbd kbd-sm">K</kbd>
	</span>
</label>
