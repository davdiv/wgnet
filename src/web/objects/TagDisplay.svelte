<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { oppositeColor } from "../../common/color";
	import type { TagInfo } from "../../node/database/requests/getAllTags";

	const { tag, ...rest }: { tag: TagInfo } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<div {...rest} class={["badge", rest.class]} class:badge-info={tag.color == null} style:background-color={tag.color} style:color={oppositeColor(tag.color)} title={tag.description}>
	{tag.name}
</div>
