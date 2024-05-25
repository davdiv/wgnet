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

const formatIPCIDRArray = (array: BinaryOrStringIPCIDR[]) => array.map(formatIPCIDR).join(",");

export const formatSystemdNetworkdNetdev = (config: WgConfig) => {
	let output = `[NetDev]\n`;
	output += formatProperty("Name", config.interfaceName ?? "wg0");
	output += formatProperty("Kind", "wireguard");
	output += "\n[WireGuard]\n";
	output += formatProperty("ListenPort", config.listenPort);
	output += formatProperty("PrivateKey", config.privateKey, formatBase64);
	output += formatProperty("FirewallMark", config.fwMark);
	for (const peer of config.peers ?? []) {
		output += "\n[WireGuardPeer]\n";
		output += formatProperty("PublicKey", peer.publicKey, formatBase64);
		output += formatProperty("PresharedKey", peer.presharedKey, formatBase64);
		output += formatProperty("AllowedIPs", peer.allowedIPs, formatIPCIDRArray);
		output += formatProperty("Endpoint", peer.endpoint);
		output += formatProperty("PersistentKeepalive", peer.persistentKeepalive);
	}
	return output;
};

export const formatSystemdNetworkdNetwork = (config: WgConfig) => {
	let output = `[Match]\n`;
	output += formatProperty("Name", config.interfaceName ?? "wg0");
	output += "\n[Network]\nIPv6AcceptRA=no\nLinkLocalAddressing=no\n";
	for (const address of config.address ?? []) {
		output += formatProperty("Address", formatIPCIDR(address));
	}
	return output;
};
