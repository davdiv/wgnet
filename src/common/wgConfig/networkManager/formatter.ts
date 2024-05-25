import type { BinaryOrStringIPCIDR } from "../../ip";
import { formatIPCIDR } from "../../ip";
import { formatBase64 } from "../../keys";
import type { WgConfig } from "../type";

const basicFormatter = <T>(a: T) => `${a}`;
const formatProperty = <T>(property: string, value: T | null | undefined, formatter: (value: T) => string = basicFormatter) => {
	if (value != null) {
		const formattedValue = formatter(value);
		return `${property}=${formattedValue}\n`;
	}
	return "";
};

const formatIPCIDRArray = (array: BinaryOrStringIPCIDR[]) => array.map((item) => `${formatIPCIDR(item)};`).join("");

export const formatNetworkManager = (config: WgConfig) => {
	let output = `[connection]\n`;
	output += formatProperty("id", config.interfaceName ?? "wg0");
	output += formatProperty("type", "wireguard");
	output += formatProperty("interface-name", config.interfaceName ?? "wg0");
	output += "\n[wireguard]\n";
	output += formatProperty("listen-port", config.listenPort);
	output += formatProperty("private-key", config.privateKey, formatBase64);
	output += formatProperty("private-key-flags", 0);
	output += formatProperty("fwmark", config.fwMark);
	for (const peer of config.peers ?? []) {
		if (peer.publicKey) {
			output += `\n[wireguard-peer.${formatBase64(peer.publicKey)}]\n`;
			output += formatProperty("endpoint", peer.endpoint);
			output += formatProperty("preshared-key", peer.presharedKey, formatBase64);
			output += formatProperty("preshared-key-flags", 0);
			output += formatProperty("allowed-ips", peer.allowedIPs, formatIPCIDRArray);
			// FIXME: check if it is persistent-keep-alive?
			output += formatProperty("persistent-keep-alive", peer.persistentKeepalive);
		}
	}
	// FIXME: add addresses
	return output;
};
