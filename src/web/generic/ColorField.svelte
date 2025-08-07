<script lang="ts">
	import { faXmark } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "./FaIcon.svelte";
	import type { FormEventHandler } from "svelte/elements";

	let { value = $bindable(), readonly, defaultColor = "#00bafe" }: { value: string | null; readonly: boolean; defaultColor?: string } = $props();

	const oninput: FormEventHandler<HTMLInputElement> = ({ target }) => {
		if (!readonly) {
			value = (target as HTMLInputElement).value;
		}
	};

	const removeColor = () => {
		value = null;
	};
</script>

<!-- FIXME: it does not seem possible to have an input type color readonly, so using disabled instead here -->
<input type="color" class="w-full" disabled={readonly} {oninput} value={value ?? defaultColor} />
{#if value != null && !readonly}
	<button type="button" class="btn btn-sm btn-ghost" onclick={removeColor}><FaIcon icon={faXmark} /></button>
{/if}
