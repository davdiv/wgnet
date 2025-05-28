import { formatBase64 } from "../keys";
import type { WgConfig, WgConfigPeer } from "./type";

export const getPrivateKeySecretName = (config: WgConfig) => {
	return `network.wireguard.wgnet.${config.name}.private`;
};
export const getPSKSecretName = (config: WgConfig, peer: WgConfigPeer) => {
	return `network.wireguard.wgnet.${config.name}.psk.${peer.name}`;
};
export const formatSystemdCreds = (config: WgConfig) => {
	let res = "#!/bin/bash\n";
	res += `alias encrypt="systemd-creds encrypt - "\n`;
	res += `CREDSTORE="/etc/credstore.encrypted/"\n`;
	if (config.privateKey) {
		res += `echo -n "${formatBase64(config.privateKey)}" | encrypt - "$CREDSTORE/${getPrivateKeySecretName(config)}"\n`;
	}
	for (const peer of config.peers ?? []) {
		if (peer.presharedKey) {
			res += `echo -n "${formatBase64(peer.presharedKey)}" | encrypt - "$CREDSTORE/${getPSKSecretName(config, peer)}"\n`;
		}
	}
	return res;
};
