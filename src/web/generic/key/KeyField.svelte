<script lang="ts">
	import EditKey from "./EditKey.svelte";
	import ShowKey from "./ShowKey.svelte";

	export let retrieveSecret: () => Promise<string | null>;
	export let generateSecret: undefined | (() => void) = undefined;
	export let removeSecret: undefined | (() => void) = undefined;
	export let updateKey: (value: string | null) => void | Promise<void>;
	export let hasSecret: boolean;

	let editKey = false;

	const callUpdateKey = async (value: string | null) => {
		await updateKey(value);
		editKey = false;
	};
</script>

{#if editKey}
	<EditKey updateKey={callUpdateKey} cancel={() => (editKey = false)} />
{:else}
	<ShowKey {hasSecret} {retrieveSecret} {generateSecret} {removeSecret} editSecret={() => (editKey = true)} />
{/if}
