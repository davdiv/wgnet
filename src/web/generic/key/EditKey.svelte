<script lang="ts">
	import { faCancel, faCheck, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
	import type { EventHandler } from "svelte/elements";
	import FaIcon from "../FaIcon.svelte";
	import InputPassword from "../InputPassword.svelte";
	import InputText from "../InputText.svelte";

	const { updateKey, cancel, secret = true }: { updateKey: (value: string | null) => void; cancel: () => void; secret?: boolean } = $props();

	const onsubmit: EventHandler<SubmitEvent, HTMLFormElement> = (event) => {
		event.preventDefault();
		updateKey(value);
	};

	let showClear = $state(false);
	let value: string | null = $state(null);
</script>

<form class="contents" {onsubmit}>
	{#if showClear || !secret}
		<InputText autofocus class="w-full" bind:value />
	{:else}
		<InputPassword autofocus type="password" class="w-full" bind:value />
	{/if}
	<div class="join">
		{#if secret}
			<button type="button" class="btn btn-sm btn-ghost join-item" onclick={() => (showClear = !showClear)} title={showClear ? "Hide key" : "Show key"}>
				<FaIcon icon={showClear ? faEyeSlash : faEye} />
			</button>
		{/if}
		<button type="submit" class="btn btn-sm btn-ghost join-item" title="Validate">
			<FaIcon icon={faCheck} />
		</button>
		<button type="button" class="btn btn-sm btn-ghost join-item" title="Cancel" onclick={cancel}>
			<FaIcon icon={faCancel} />
		</button>
	</div>
</form>
