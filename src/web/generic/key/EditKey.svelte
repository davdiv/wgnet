<script lang="ts">
	import { faCancel, faCheck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "../FaIcon.svelte";
	import InputPassword from "../InputPassword.svelte";
	import InputText from "../InputText.svelte";

	export let updateKey: (value: string | null) => void;
	export let cancel: () => void;
	export let secret = true;

	let showClear = false;
	let value: string | null = null;
</script>

<form class="contents" on:submit|preventDefault={() => updateKey(value)}>
	{#if showClear || !secret}
		<InputText autofocus class="w-full" bind:value />
	{:else}
		<InputPassword autofocus type="password" class="w-full" bind:value />
	{/if}
	<div class="join">
		{#if secret}
			<button type="button" class="btn btn-sm btn-ghost join-item" on:click={() => (showClear = !showClear)} title={showClear ? "Hide key" : "Show key"}>
				<FaIcon icon={showClear ? faEyeSlash : faEye} />
			</button>
		{/if}
		<button type="submit" class="btn btn-sm btn-ghost join-item" title="Validate">
			<FaIcon icon={faCheck} />
		</button>
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Cancel" on:click={cancel}>
			<FaIcon icon={faCancel} />
		</button>
	</div>
</form>
