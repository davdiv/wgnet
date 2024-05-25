<script lang="ts">
	import { faKey, faLock, faXmark } from "@fortawesome/free-solid-svg-icons";
	import type { PeerInfo } from "../../node/database/requests/getAllPeers";
	import FaIcon from "../generic/FaIcon.svelte";
	export let peer: PeerInfo;
</script>

<span title={peer.hasPrivateKey ? "A private key has been configured for this peer." : peer.publicKey ? "A public key has been configured for this peer." : "No key has been configured for this peer."}
	><FaIcon icon={peer.hasPrivateKey ? faKey : peer.publicKey ? faLock : faXmark} /></span
>
