<script lang="ts">
	import { faDownload, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
	import { availableOutputFormats } from "../../common/wgConfig/format";
	import FaIcon from "../generic/FaIcon.svelte";
	import type { Match } from "../router/matchPath";
	import { createPeerConfigLogic } from "./peerConfigLogic";

	export let match: Match;

	const { matchParams$, format$, formattedConfig$, configURL$, configFileName$, showConfig$ } = createPeerConfigLogic();

	$: matchParams$.set(match.params as any);
</script>

<div class="flex flex-col w-full absolute top-0 bottom-0">
	<div class="flex-none p-3 flex gap-2">
		<label>
			<span class="flex-none">Format:</span>
			<select class="select select-ghost flex-none" bind:value={$format$}>
				<option value=""></option>
				{#each availableOutputFormats as possibleFormat (possibleFormat)}
					<option value={possibleFormat}>{possibleFormat}</option>
				{/each}
			</select>
		</label>
		{#if $configURL$ && $configFileName$ && $formattedConfig$}
			<button
				type="button"
				class="btn btn-ghost"
				on:click={() => {
					$showConfig$ = !$showConfig$;
				}}><FaIcon icon={$showConfig$ ? faEyeSlash : faEye} /><span class="hidden sm:inline">{$showConfig$ ? "Hide configuration" : "Show configuration"}</span></button
			>
			<a href={$configURL$} download={$configFileName$} class="btn btn-ghost"><FaIcon icon={faDownload} /><span class="hidden sm:inline">Download</span></a>
		{/if}
	</div>
	{#if $showConfig$ && $format$ && $formattedConfig$}
		{#if $format$ === "qrcode"}
			{@html $formattedConfig$}
		{:else if $format$}
			<textarea class="flex-1 w-full p-3 font-mono" readonly>{$formattedConfig$}</textarea>
		{/if}
	{/if}
</div>
