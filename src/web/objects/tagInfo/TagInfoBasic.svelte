<script lang="ts">
	import { faRotateLeft, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
	import type { TagInfo } from "../../../node/database/requests/getAllTags";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import Textarea from "../../generic/Textarea.svelte";
	import { updateTag } from "../../requests";
	import TagDisplay from "../TagDisplay.svelte";
	import { userInfo$ } from "../../data";

	let tagEdit: TagInfo;
	const editTag = (tag: TagInfo) => {
		tagEdit = { ...tag };
	};

	export let tag: TagInfo;

	$: editTag(tag);
	$: readonly = !$userInfo$.wgnet?.tagsAdmin;
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Basic properties</span>
	</svelte:fragment>
	<form
		class="contents"
		on:submit|preventDefault={() => {
			updateTag(tagEdit);
		}}
	>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="input input-ghost flex items-center gap-2">
			<span class="font-bold flex-none">Name</span>
			<InputText class="w-full" bind:value={tagEdit.name} {readonly} />
		</label>
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="input input-ghost h-auto flex flex-col p-0">
			<span class="font-bold flex-none px-4 pb-1">Description</span>
			<Textarea placeholder="Empty description" class="w-full px-4 h-16 outline-0 bg-transparent" bind:value={tagEdit.description} {readonly} /></label
		>
		<label class="input input-ghost flex items-center gap-2">
			<span class="font-bold flex-none">Color</span>
			<!-- FIXME: it does not seem possible to have an input type color readonly, so using disabled instead here -->
			<input type="color" class="w-full" bind:value={tagEdit.color} disabled={readonly} />
			{#if tagEdit.color != null && !readonly}
				<button type="button" class="btn btn-sm btn-ghost" on:click|preventDefault={() => (tagEdit.color = null)}><FaIcon icon={faXmark} /></button>
			{/if}
		</label>
		<div class="flex gap-2 items-center justify-end">
			<TagDisplay class="mx-3" tag={tagEdit} />
			{#if !readonly}
				<button type="submit" class="btn btn-sm btn-primary"><FaIcon icon={faUpload} />Save</button>
				<button
					type="button"
					class="btn btn-sm btn-secondary"
					on:click={() => {
						editTag(tag);
					}}><FaIcon icon={faRotateLeft} />Reset</button
				>
			{/if}
		</div>
	</form>
</Collapse>
