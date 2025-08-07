<script lang="ts">
	import type { HTMLAnchorAttributes, MouseEventHandler } from "svelte/elements";
	import { navigate } from "./locationStore";

	const { href, onclick, children, ...rest }: HTMLAnchorAttributes = $props();

	const onClickHandler: MouseEventHandler<HTMLAnchorElement> = (event) => {
		event.preventDefault();
		onclick?.(event);
		if (href) navigate(href);
	};
</script>

<a {...rest} onclick={onClickHandler} href={href ?? "javascript:void(0);"}>
	{@render children?.()}
</a>
