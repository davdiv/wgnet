<script lang="ts">
	import { faRotateLeft, faUpload, faXmark } from "@fortawesome/free-solid-svg-icons";
	import type { TagInfo } from "../../../node/database/requests/getAllTags";
	import { userInfo$ } from "../../data";
	import FormContainer from "../../forms/FormContainer.svelte";
	import { type FieldDefinition, createForm, simpleField } from "../../forms/formLogic.svelte";
	import Collapse from "../../generic/Collapse.svelte";
	import FaIcon from "../../generic/FaIcon.svelte";
	import InputText from "../../generic/InputText.svelte";
	import Textarea from "../../generic/Textarea.svelte";
	import { updateTag } from "../../requests";
	import TagDisplay from "../TagDisplay.svelte";

	const { tag }: { tag: TagInfo } = $props();

	const readonly = $derived(!$userInfo$.wgnet?.tagsAdmin);
	const formHref = $derived(`/tags/${tag.id}`);

	const form = createForm({
		get formHref() {
			return formHref;
		},
		get readonly() {
			return readonly;
		},
		get originalValue() {
			return tag;
		},
		submit: updateTag,
		fields: {
			name: simpleField,
			description: simpleField,
			color: simpleField as FieldDefinition<any, string | null>,
		},
	});
	const removeColor = () => {
		form.fields.color = null;
	};
</script>

<Collapse>
	<svelte:fragment slot="title">
		<span class="flex-none">Basic properties</span>
	</svelte:fragment>
	<FormContainer {form}>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Name</span>
			<InputText class="w-full" bind:value={form.fields.name} {readonly} />
		</label>
		<label class="input input-ghost w-full h-auto flex flex-col p-0">
			<span class="font-bold flex-none px-3 pb-1 self-start">Description</span>
			<Textarea placeholder="Empty description" class="w-full px-4 h-16 outline-0 bg-transparent" bind:value={form.fields.description} {readonly} /></label
		>
		<label class="input input-ghost w-full flex items-center gap-2">
			<span class="font-bold flex-none">Color</span>
			<!-- FIXME: it does not seem possible to have an input type color readonly, so using disabled instead here -->
			<input type="color" class="w-full" bind:value={form.fields.color} disabled={readonly} />
			{#if form.fields.color != null && !readonly}
				<button type="button" class="btn btn-sm btn-ghost" onclick={removeColor}><FaIcon icon={faXmark} /></button>
			{/if}
		</label>
		<div class="flex gap-2 items-center justify-end">
			<TagDisplay class="mx-3" tag={form.modifiedValue} />
			{#if !readonly}
				<button type="submit" class="btn btn-sm btn-primary"><FaIcon icon={faUpload} />Save</button>
				<button type="button" class="btn btn-sm btn-secondary" onclick={form.reset}><FaIcon icon={faRotateLeft} />Reset</button>
			{/if}
		</div>
	</FormContainer>
</Collapse>
