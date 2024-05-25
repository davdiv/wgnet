<script lang="ts">
	import { allPeerLinksMap$ } from "../data";
	import KeyField from "../generic/key/KeyField.svelte";
	import { getPeerLinkPresharedKey, upsertPeerLink } from "../requests";

	export let linkId: string;

	$: linkInfo = $allPeerLinksMap$[linkId];
</script>

<div class="input input-ghost flex items-center gap-2">
	<span class="font-bold flex-none">Preshared key</span>
	{#key linkInfo}
		<KeyField
			retrieveSecret={() => getPeerLinkPresharedKey(linkId)}
			generateSecret={() => upsertPeerLink(linkId, "generate")}
			removeSecret={() => upsertPeerLink(linkId, null)}
			hasSecret={!!linkInfo.hasPSK}
			updateKey={(value) => upsertPeerLink(linkId, value)}
		/>
	{/key}
</div>
