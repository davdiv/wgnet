<script lang="ts">
	import { faPen } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "../generic/FaIcon.svelte";
	import Link from "../router/Link.svelte";
	import { formsData } from "./formData.svelte";
	const onbeforeunload = (event: BeforeUnloadEvent) => {
		event.preventDefault();
	};
</script>

<svelte:window {onbeforeunload} />
<div class="dropdown">
	<div tabindex="0" role="button" class="btn btn-ghost text-xl m-1" title="Unsaved changes"><FaIcon icon={faPen} /></div>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
		{#each formsData.keys() as url (url)}
			<li><Link href={url}>{url}</Link></li>
		{/each}
	</ul>
</div>
