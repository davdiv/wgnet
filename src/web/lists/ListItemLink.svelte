<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes } from "svelte/elements";
	import Link from "../router/Link.svelte";

	const { children, actions, ...rest }: { children?: Snippet; actions?: Snippet } & HTMLAnchorAttributes = $props();
</script>

<div class="flex gap-2 items-center">
	<Link {...rest} class={["p-3 flex grow gap-2 items-center even:bg-slate-50 hover:bg-slate-200 focus:bg-slate-200", rest.class]}>
		{@render children?.()}
	</Link>
	{@render actions?.()}
</div>
