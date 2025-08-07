<script lang="ts">
	import EditKey from "./EditKey.svelte";
	import ShowKey from "./ShowKey.svelte";

	const {
		retrieveSecret = undefined,
		generateSecret = undefined,
		removeSecret = undefined,
		updateKey = undefined,
		hasSecret,
	}: {
		retrieveSecret?: undefined | (() => Promise<string | null>);
		generateSecret?: undefined | (() => void);
		removeSecret?: undefined | (() => void);
		updateKey?: undefined | ((value: string | null) => void | Promise<void>);
		hasSecret: boolean;
	} = $props();

	let editKey = $state(false);

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
