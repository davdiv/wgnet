<script lang="ts">
	import { writable } from "@amadeus-it-group/tansu";
	import { faEdit, faEye, faEyeSlash, faShuffle, faTrash } from "@fortawesome/free-solid-svg-icons";
	import { promiseStoreToValueStore } from "../../../common/promiseToStore";
	import FaIcon from "../FaIcon.svelte";
	import InputText from "../InputText.svelte";
	const hiddenSecret = "*".repeat(44);

	export let retrieveSecret: () => Promise<string | null>;
	export let generateSecret: undefined | (() => void) = undefined;
	export let removeSecret: undefined | (() => void) = undefined;
	export let editSecret: undefined | (() => void) = undefined;
	export let hasSecret: boolean;

	const infoPromise$ = writable(null as null | Promise<string | null>);
	const info$ = promiseStoreToValueStore(infoPromise$, null);

	const onClick = () => {
		if ($infoPromise$) {
			$infoPromise$ = null;
		} else {
			$infoPromise$ = retrieveSecret();
		}
	};
</script>

{#if $info$}
	<InputText autofocus type="text" class="w-full" value={$info$} readonly />
{:else}
	<input type="password" class="w-full" value={hasSecret ? hiddenSecret : ""} readonly />
{/if}
<div class="join">
	{#if hasSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" on:click={onClick} title={$infoPromise$ ? "Hide key" : "Show key"}><FaIcon icon={$infoPromise$ ? faEyeSlash : faEye} /></button>
	{/if}
	{#if generateSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Generate new key" on:click={() => generateSecret()}><FaIcon icon={faShuffle} /></button>
	{/if}
	{#if removeSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Remove key" on:click={() => removeSecret()}><FaIcon icon={faTrash} /></button>
	{/if}
	{#if editSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Edit key" on:click={() => editSecret()}><FaIcon icon={faEdit} /></button>
	{/if}
	<slot />
</div>
