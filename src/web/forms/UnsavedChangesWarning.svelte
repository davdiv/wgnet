<script lang="ts">
	import { faPen } from "@fortawesome/free-solid-svg-icons";
	import FaIcon from "../generic/FaIcon.svelte";
	import { hasFocusDirective, navDirective, openerDirective, showPopup$, stopForceClose } from "./unsavedChangesLogic";

	const onbeforeunload = (event: BeforeUnloadEvent) => {
		event.preventDefault();
	};
</script>

<svelte:window {onbeforeunload} />
<button type="button" onclick={stopForceClose} class={["btn btn-ghost text-xl m-1", { "btn-active": $showPopup$ }]} title="Unsaved changes" use:hasFocusDirective use:navDirective use:openerDirective
	><FaIcon icon={faPen} /></button
>
