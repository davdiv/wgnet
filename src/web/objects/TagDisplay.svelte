<script lang="ts">
	import type { TagInfo } from "../../node/database/requests/getAllTags";
	import { oppositeColor } from "../../common/color";

	export let tag: TagInfo;
</script>

<div {...$$restProps} class="badge {$$restProps.class}" class:badge-info={tag.color == null} style:background-color={tag.color} style:color={oppositeColor(tag.color)} title={tag.description}>
	{tag.name}
</div>
