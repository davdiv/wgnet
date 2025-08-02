<script lang="ts" generics="T, F extends object">
	import type { Snippet } from "svelte";
	import type { Form } from "./formLogic.svelte";

	const {
		children,
		form,
	}: {
		children?: Snippet;
		form: Form<T, F>;
	} = $props();

	const onsubmit = (event: SubmitEvent) => {
		event.preventDefault();
		form.submit();
	};
</script>

<form class="contents" {onsubmit}>{@render children?.()}</form>
