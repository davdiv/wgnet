<script lang="ts">
	import TagInfo from "../objects/tagInfo/TagInfo.svelte";
	import type { Match } from "../router/matchPath";
	import { allTagsMap$ } from "../data";
	import FaIcon from "../generic/FaIcon.svelte";
	import { faCircleXmark } from "@fortawesome/free-solid-svg-icons";

	export let match: Match;

	$: tag = $allTagsMap$[+match.params.id];
</script>

{#if tag}
	{#key tag.id}
		<TagInfo {tag} />
	{/key}
{:else}
	<div class="flex m-3">
		<div role="alert" class="alert alert-error">
			<FaIcon icon={faCircleXmark} />
			<span>The selected tag does not exist. It may have been deleted.</span>
		</div>
	</div>
{/if}
