<script lang="ts">
	import { writable } from "@amadeus-it-group/tansu";
	import { transformNull, enableAutofocus } from "./inputLogic";

	export let value: string | null;
	export let autofocus = false;
	export let readonly = false;

	const value$ = writable(value);
	const binding$ = transformNull(value$);
	const fromModel = (value: string | null) => ($value$ = value);
	const toModel = (newValue: string | null) => (value = newValue);
	$: fromModel(value);
	$: toModel($value$);
</script>

<textarea {...$$restProps} bind:value={$binding$} use:enableAutofocus={autofocus} {readonly}></textarea>
