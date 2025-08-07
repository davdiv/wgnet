<script lang="ts">
	import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
	import type { SVGAttributes } from "svelte/elements";

	const { icon, ...rest }: { icon: IconDefinition } & SVGAttributes<SVGElement> = $props();

	const boxWidth = $derived(icon.icon[0]);
	const boxHeight = $derived(icon.icon[1]);
	const path = $derived(icon.icon[4] as string);
</script>

<svg {...rest} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {boxWidth} {boxHeight}" class={["icon", rest.class]}>
	<path d={path} />
</svg>

<style>
	svg.icon {
		height: 1em;
	}

	path {
		fill: currentColor;
	}
</style>
