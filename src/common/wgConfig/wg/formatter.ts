import { formatIPCIDR } from "../../ip";
import { formatBase64 } from "../../keys";
import type { WgConfig } from "../type";

const basicFormatter = <T>(a: T) => `${a}`;
const formatProperty = <T>(property: string, value: T | null | undefined, formatter: (value: T) => string = basicFormatter) => {
	if (value != null) {
		const formattedValue = formatter(value);
		return `${property} = ${formattedValue}\n`;
	}
	return "";
};

export const formatWgConfig = (config: WgConfig) => {
	let output = `[Interface]\n`;
	output += formatProperty("ListenPort", config.listenPort);
	output += formatProperty("FwMark", config.fwMark);
	output += formatProperty("PrivateKey", config.privateKey, formatBase64);
	for (const address of config.address ?? []) {
		output += formatProperty("Address", address, formatIPCIDR);
	}
	for (const peer of config.peers ?? []) {
		output += "\n[Peer]\n";
		output += formatProperty("PublicKey", peer.publicKey, formatBase64);
		output += formatProperty("PresharedKey", peer.presharedKey, formatBase64);
		for (const cidr of peer.allowedIPs ?? []) {
			output += formatProperty("AllowedIPs", cidr, formatIPCIDR);
		}
		output += formatProperty("Endpoint", peer.endpoint);
		output += formatProperty("PersistentKeepalive", peer.persistentKeepalive);
	}
	return output;
};
