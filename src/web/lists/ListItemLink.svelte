<script lang="ts">
	import Link from "../router/Link.svelte";
</script>

<div class="flex gap-2 items-center">
	<Link {...$$restProps} class="p-3 flex grow gap-2 items-center even:bg-slate-50 hover:bg-slate-200 focus:bg-slate-200 {$$restProps.class ?? ''}">
		<slot />
	</Link>
	<slot name="actions" />
</div>
