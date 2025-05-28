import { formatBase64 } from "../keys";
import type { WgConfig, WgConfigPeer } from "./type";

export const getPrivateKeySecretName = (config: WgConfig) => {
	return `network.wireguard.wgnet.${config.name}.private`;
};
export const getPublicKeySecretName = (config: WgConfig, peer: WgConfigPeer) => {
	return `network.wireguard.wgnet.${config.name}.public.${peer.name}`;
};
export const getPSKSecretName = (config: WgConfig, peer: WgConfigPeer) => {
	return `network.wireguard.wgnet.${config.name}.psk.${peer.name}`;
};
export const formatSystemdCreds = (config: WgConfig) => {
	let res = "#!/bin/bash\n";
	res += `alias encrypt="systemd-creds encrypt"\n`;
	res += `CREDSTORE_ENC="/etc/credstore.encrypted/"\n`;
	res += `CREDSTORE_CLEAR="/etc/credstore/"\n`;
	if (config.privateKey) {
		res += `echo -n "${formatBase64(config.privateKey)}" | encrypt - "$CREDSTORE_ENC/${getPrivateKeySecretName(config)}"\n`;
	}
	for (const peer of config.peers ?? []) {
		if (peer.publicKey) {
			res += `echo -n "${formatBase64(peer.publicKey)}" > "$CREDSTORE_CLEAR/${getPublicKeySecretName(config, peer)}"\n`;
		}
		if (peer.presharedKey) {
			res += `echo -n "${formatBase64(peer.presharedKey)}" | encrypt - "$CREDSTORE_ENC/${getPSKSecretName(config, peer)}"\n`;
		}
	}
	return res;
};
