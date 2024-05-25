import { stringify } from "yaml";
import type { BinaryOrStringIPCIDR } from "../../ip";
import { formatIPCIDR } from "../../ip";
import { formatBase64 } from "../../keys";
import type { WgConfig, WgConfigPeer } from "../type";

const ident = <T>(a: T) => a;
const setIfDefined = <T>(dest: any, key: string, value: T | null | undefined, formatter: (value: T) => any = ident) => {
	if (value != null) {
		dest[key] = formatter(value);
	}
};

const formatIPCIDRArray = (array: BinaryOrStringIPCIDR[]) => array.map(formatIPCIDR);

const formatPeer = (peer: WgConfigPeer) => {
	const res: any = {};
	setIfDefined(res, "public_key", peer.publicKey, formatBase64);
	setIfDefined(res, "preshared_key", peer.presharedKey, formatBase64);
	setIfDefined(res, "endpoint", peer.endpoint);
	setIfDefined(res, "persistent_keepalive_interval", peer.persistentKeepalive);
	setIfDefined(res, "allowedips", peer.allowedIPs, formatIPCIDRArray);
	return res;
};

const formatPeerArray = (array: WgConfigPeer[]) => array.map(formatPeer);

export const ifstateFormatter = (config: WgConfig) => {
	const wireguard: any = {};
	const res: any = {
		name: config.interfaceName ?? "wg0",
		link: {
			state: "up",
			kind: "wireguard",
		},
		wireguard,
	};
	setIfDefined(res, "addresses", config.address, formatIPCIDRArray);
	setIfDefined(wireguard, "private_key", config.privateKey, formatBase64);
	setIfDefined(wireguard, "listen_port", config.listenPort);
	setIfDefined(wireguard, "fwmark", config.fwMark);
	setIfDefined(wireguard, "peers", config.peers, formatPeerArray);
	return stringify(res);
};
