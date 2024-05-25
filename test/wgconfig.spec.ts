import { expect, test } from "vitest";
import { parseIPCIDR } from "../src/common/ip";
import { parse32BytesBase64 } from "../src/common/keys";
import type { WgConfig } from "../src/common/wgConfig/type";
import { formatWgConfig } from "../src/common/wgConfig/wg/formatter";
import { parseWgConfig } from "../src/common/wgConfig/wg/parser";

const checkWgConfig = (strConfig: string, wgConfig: WgConfig) => {
	expect(parseWgConfig(strConfig)).toEqual(wgConfig);
	expect(formatWgConfig(wgConfig)).toBe(strConfig);
};

test("format and parse wireguard config", () => {
	checkWgConfig(`[Interface]\n`, {});
	checkWgConfig(`[Interface]\nListenPort = 5000\n`, { listenPort: 5000 });
	checkWgConfig(
		`[Interface]\nListenPort = 5000\nPrivateKey = KHk8Kq+gKJUNWIi2RCZowJ0vACQaNmymQgUv0NTkGFo=\n\n[Peer]\nPublicKey = 2e4aAH9IjInXYcobkC/FlAMATxjsX72Kqv8qT7H6jUU=\nAllowedIPs = 10.1.2.1/32\nAllowedIPs = 10.1.3.1/24\n`,
		{
			privateKey: parse32BytesBase64("KHk8Kq+gKJUNWIi2RCZowJ0vACQaNmymQgUv0NTkGFo="),
			listenPort: 5000,
			peers: [
				{
					allowedIPs: [parseIPCIDR("10.1.2.1/32"), parseIPCIDR("10.1.3.1/24")],
					publicKey: parse32BytesBase64("2e4aAH9IjInXYcobkC/FlAMATxjsX72Kqv8qT7H6jUU="),
				},
			],
		},
	);
	expect(parseWgConfig(`[Interface]\nAddress = 192.168.1.1/24, 192.168.2.1/24`)).toEqual({
		address: [parseIPCIDR("192.168.1.1/24"), parseIPCIDR("192.168.2.1/24")],
	});
	expect(
		formatWgConfig({
			address: [parseIPCIDR("192.168.1.1/24"), parseIPCIDR("192.168.2.1/24")],
		}),
	).toBe(`[Interface]\nAddress = 192.168.1.1/24\nAddress = 192.168.2.1/24\n`);
});
