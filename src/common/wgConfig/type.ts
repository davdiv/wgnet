import type { BinaryOrStringIPCIDR } from "../ip";
import type { Base64OrBinaryKey } from "../keys";

export interface WgConfig {
	name?: string | null;
	interfaceName?: string | null;
	listenPort?: number | null;
	fwMark?: number | null;
	privateKey?: Base64OrBinaryKey | null;
	peers?: WgConfigPeer[] | null;
	address?: BinaryOrStringIPCIDR[] | null;
}

export interface WgConfigPeer {
	name?: string | null;
	publicKey?: Base64OrBinaryKey | null;
	presharedKey?: Base64OrBinaryKey | null;
	hasPSK?: 0 | 1;
	allowedIPs?: BinaryOrStringIPCIDR[] | null;
	endpoint?: string | null;
	persistentKeepalive?: number | null;
}
