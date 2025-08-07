<script lang="ts">
	import { allPeerLinksMap$ } from "../data";
	import KeyField from "../generic/key/KeyField.svelte";
	import { getPeerLinkPresharedKey, upsertPeerLink } from "../requests";

	const { linkId, canEdit, canViewKey }: { linkId: string; canEdit: boolean; canViewKey: boolean } = $props();

	const linkInfo = $derived($allPeerLinksMap$[linkId]);
</script>

<div class="input input-ghost w-full flex items-center gap-2">
	<span class="font-bold flex-none">Preshared key</span>
	{#key linkInfo}
		<KeyField
			retrieveSecret={canViewKey ? () => getPeerLinkPresharedKey(linkId) : undefined}
			generateSecret={canEdit ? () => upsertPeerLink(linkId, "generate") : undefined}
			removeSecret={canEdit ? () => upsertPeerLink(linkId, null) : undefined}
			hasSecret={!!linkInfo.hasPSK}
			updateKey={canEdit ? (value) => upsertPeerLink(linkId, value) : undefined}
		/>
	{/key}
</div>
