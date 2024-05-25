<script lang="ts">
	import Tags from "../lists/Tags.svelte";
	import { allTags$ } from "../data";
</script>

<Tags tags={$allTags$} />
