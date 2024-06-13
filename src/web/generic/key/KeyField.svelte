<script lang="ts">
	import EditKey from "./EditKey.svelte";
	import ShowKey from "./ShowKey.svelte";

	export let retrieveSecret: undefined | (() => Promise<string | null>) = undefined;
	export let generateSecret: undefined | (() => void) = undefined;
	export let removeSecret: undefined | (() => void) = undefined;
	export let updateKey: undefined | ((value: string | null) => void | Promise<void>) = undefined;
	export let hasSecret: boolean;

	let editKey = false;

	const callUpdateKey = async (value: string | null) => {
		if (updateKey) {
			await updateKey(value);
			editKey = false;
		}
	};
</script>

{#if editKey}
	<EditKey updateKey={callUpdateKey} cancel={() => (editKey = false)} />
{:else}
	<ShowKey {hasSecret} {retrieveSecret} {generateSecret} {removeSecret} editSecret={updateKey ? () => (editKey = true) : undefined} />
{/if}
