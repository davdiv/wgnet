import type { BinaryOrStringIPCIDR } from "../../ip";
import { formatIPCIDR, parseIPCIDR } from "../../ip";
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

const generateIpSection = (ips: BinaryOrStringIPCIDR[]) => {
	const length = ips.length;
	if (length === 0) {
		return "method=disabled\n";
	}
	let output = "method=manual\n";
	for (let i = 0; i < length; i++) {
		output += `address${i + 1}=${formatIPCIDR(ips[i])}\n`;
	}
	return output;
};

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

	const ipv4: BinaryOrStringIPCIDR[] = [];
	const ipv6: BinaryOrStringIPCIDR[] = [];
	for (const address of config.address ?? []) {
		const ip = parseIPCIDR(address);
		(ip[0].length === 4 ? ipv4 : ipv6).push(address);
	}

	output += "\n[ipv4]\n";
	output += generateIpSection(ipv4);

	output += "\n[ipv6]\n";
	output += generateIpSection(ipv6);

	return output;
};
