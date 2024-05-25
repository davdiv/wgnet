<script lang="ts">
	import { navigate } from "./locationStore";

	export let href: undefined | string = undefined;
	export let onClick: undefined | ((event: MouseEvent) => void) = undefined;

	const onClickHandler = (event: MouseEvent) => {
		onClick?.(event);
		if (href) navigate(href);
	};
</script>

<a on:click|preventDefault={onClickHandler} href={href ?? "javascript:void(0);"} {...$$restProps}>
	<slot />
</a>
