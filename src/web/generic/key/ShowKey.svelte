<script lang="ts">
	import { writable } from "@amadeus-it-group/tansu";
	import { faEdit, faEye, faEyeSlash, faShuffle, faTrash } from "@fortawesome/free-solid-svg-icons";
	import type { Snippet } from "svelte";
	import { promiseStoreToValueStore } from "../../../common/promiseToStore";
	import FaIcon from "../FaIcon.svelte";
	import InputText from "../InputText.svelte";
	const hiddenSecret = "*".repeat(44);

	const {
		retrieveSecret = undefined,
		generateSecret = undefined,
		removeSecret = undefined,
		editSecret = undefined,
		hasSecret,
		children,
	}: {
		retrieveSecret?: undefined | (() => Promise<string | null>);
		generateSecret?: undefined | (() => void);
		removeSecret?: undefined | (() => void);
		editSecret?: undefined | (() => void);
		hasSecret: boolean;
		children?: Snippet;
	} = $props();

	const infoPromise$ = writable(null as null | Promise<string | null>);
	const info$ = promiseStoreToValueStore(infoPromise$, null);

	const onClick = () => {
		if ($infoPromise$) {
			$infoPromise$ = null;
		} else if (retrieveSecret) {
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
	{#if hasSecret && retrieveSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" onclick={onClick} title={$infoPromise$ ? "Hide key" : "Show key"}><FaIcon icon={$infoPromise$ ? faEyeSlash : faEye} /></button>
	{/if}
	{#if generateSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Generate new key" onclick={() => generateSecret()}><FaIcon icon={faShuffle} /></button>
	{/if}
	{#if removeSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Remove key" onclick={() => removeSecret()}><FaIcon icon={faTrash} /></button>
	{/if}
	{#if editSecret}
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Edit key" onclick={() => editSecret()}><FaIcon icon={faEdit} /></button>
	{/if}
	{@render children?.()}
</div>
