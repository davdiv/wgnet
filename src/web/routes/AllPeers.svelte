<script lang="ts">
	import Peers from "../lists/Peers.svelte";
	import { allPeers$ } from "../data";
</script>

<Peers peers={$allPeers$} />
