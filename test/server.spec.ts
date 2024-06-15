import type { FastifyInstance } from "fastify";
import { rm } from "fs/promises";
import { join } from "path";
import { beforeEach, expect, test } from "vitest";
import { formatBase64 } from "../src/common/keys";
import type { WgConfig } from "../src/common/wgConfig/type";
import { formatWgConfig } from "../src/common/wgConfig/wg/formatter";
import type { PeerInfo } from "../src/node/database/requests/getAllPeers";
import type { TagInfo } from "../src/node/database/requests/getAllTags";
import type { DBNewPeer, DBNewTag, DBPeerEndpoint, DBPeerEndpointKey, DBPeerIp, DBPeerIpKey, DBPeerLink, DBPeerLinkKey, StringifiedBinary } from "../src/node/database/types";
import { extractKey, generate32BytesKey, generateKeys, parsePublicKey } from "../src/node/keys";
import { createServer } from "../src/node/routes";
import { pcTag } from "./peerConditionUtils";
import { mkTempDir } from "./utils";

const headerTypeJson = { "Content-Type": "application/json" };

let server: FastifyInstance;
let cookies: Record<string, string>;
beforeEach(async () => {
	const tempDir = await mkTempDir();
	server = createServer({
		authenticationConfig: {
			type: "basic",
			jwtKey: generate32BytesKey(),
		},
		databaseConfig: {
			database: join(tempDir, "wgnet.db"),
			secret: generate32BytesKey(),
		},
	});
	await server.ready();
	const auth = server.jwt.sign({});
	cookies = { auth };
	return async () => {
		await server.close();
		await rm(tempDir, { recursive: true });
	};
});

const createPeer = async (props: Partial<StringifiedBinary<DBNewPeer>>) => {
	const res = await server.inject({
		url: "/api/peers",
		method: "POST",
		headers: headerTypeJson,
		body: JSON.stringify(props),
		cookies,
	});
	expect(res.statusCode).toBe(200);
	const { id } = res.json();
	expect(id).toBeTypeOf("number");
	return id;
};

const createTag = async (props: Partial<StringifiedBinary<DBNewTag>>) => {
	const res = await server.inject({
		url: "/api/tags",
		method: "POST",
		headers: headerTypeJson,
		body: JSON.stringify(props),
		cookies,
	});
	expect(res.statusCode).toBe(200);
	const { id } = res.json();
	expect(id).toBeTypeOf("number");
	return id;
};

const addIp = async (peerId: number, ip: string, params: Partial<Omit<StringifiedBinary<DBPeerIp>, keyof DBPeerIpKey>>) => {
	const res = await server.inject({
		url: `/api/peers/${peerId}/ips/${ip}`,
		method: "PUT",
		headers: headerTypeJson,
		body: JSON.stringify(params),
		cookies,
	});
	expect(res.statusCode).toBe(204);
};

const addEndpoint = async (peerId: number, endpoint: string, params: Partial<Omit<StringifiedBinary<DBPeerEndpoint>, keyof DBPeerEndpointKey>>) => {
	const res = await server.inject({
		url: `/api/peers/${peerId}/endpoints/${endpoint}`,
		method: "PUT",
		headers: headerTypeJson,
		body: JSON.stringify(params),
		cookies,
	});
	expect(res.statusCode).toBe(204);
};

const setPeerTags = async (peer: number, tags: number[]) => {
	const res = await server.inject({
		url: `/api/peers/${peer}/tags`,
		method: "PUT",
		headers: headerTypeJson,
		body: JSON.stringify({ tags }),
		cookies,
	});
	expect(res.statusCode).toBe(204);
};

const linkPeers = async (peer1: number, peer2: number, params: Partial<Omit<StringifiedBinary<DBPeerLink>, keyof DBPeerLinkKey>>) => {
	const res = await server.inject({
		url: `/api/peerLinks/${peer1}-${peer2}`,
		method: "POST",
		headers: headerTypeJson,
		body: JSON.stringify(params),
		cookies,
	});
	expect(res.statusCode).toBe(204);
};

const expectConfig = async (peer: number, config: WgConfig) => {
	const res = await server.inject({
		url: `/api/peers/${peer}/config/wg`,
		cookies,
	});
	expect(res.statusCode).toBe(200);
	expect(res.body).toEqual(formatWgConfig(config));
};

test("add/update/delete peer", async () => {
	let res = await server.inject({ url: "/api/peers", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	expect(await res.json()).toEqual([]);
	const id = await createPeer({ name: "myPeer1", privateKey: "generate", interfaceName: "wg1" });
	res = await server.inject({ url: "/api/peers", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	let json: PeerInfo[] = res.json();
	expect(json.length).toBe(1);
	expect(json[0].id).toBe(id);
	expect(json[0].name).toBe("myPeer1");
	expect(json[0].interfaceName).toBe("wg1");
	expect(json[0].hasPrivateKey).toBe(1);
	const publicKey = json[0].publicKey!;
	expect(publicKey).toBeTypeOf("string");
	expect(formatBase64(extractKey(parsePublicKey(publicKey)))).toBe(json[0].publicKey);
	res = await server.inject({
		url: `/api/peers/${id}`,
		method: "PUT",
		headers: headerTypeJson,
		body: JSON.stringify({ name: "renamedMyPeer1", listenPort: 3000 } satisfies Partial<StringifiedBinary<DBNewPeer>>),
		cookies,
	});
	expect(res.statusCode).toBe(204);
	res = await server.inject({ url: "/api/peers", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	json = res.json();
	expect(json.length).toBe(1);
	expect(json[0].id).toBe(id);
	expect(json[0].name).toBe("renamedMyPeer1");
	expect(json[0].listenPort).toBe(3000);
	expect(json[0].hasPrivateKey).toBe(1);
	expect(json[0].publicKey).toBe(publicKey); // should not have changed
	res = await server.inject({ url: `/api/peers/${id}`, method: "DELETE", cookies });
	expect(res.statusCode).toBe(204);
	res = await server.inject({ url: "/api/peers", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	expect(res.json()).toEqual([]);
});

test("add/update/delete tag", async () => {
	let res = await server.inject({ url: "/api/tags", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	expect(res.json()).toEqual([]);
	const id = await createTag({ name: "myTag1", description: "my description" });
	res = await server.inject({ url: "/api/tags", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	let json: TagInfo[] = res.json();
	expect(json.length).toBe(1);
	expect(json[0].id).toBe(id);
	expect(json[0].name).toBe("myTag1");
	expect(json[0].description).toBe("my description");
	res = await server.inject({
		url: `/api/tags/${id}`,
		method: "PUT",
		headers: headerTypeJson,
		body: JSON.stringify({ name: "renamedTag1", description: "other description" } satisfies Partial<StringifiedBinary<DBNewTag>>),
		cookies,
	});
	expect(res.statusCode).toBe(204);
	res = await server.inject({ url: "/api/tags", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	json = res.json();
	expect(json.length).toBe(1);
	expect(json[0].id).toBe(id);
	expect(json[0].name).toBe("renamedTag1");
	expect(json[0].description).toBe("other description");
	res = await server.inject({ url: `/api/tags/${id}`, method: "DELETE", cookies });
	expect(res.statusCode).toBe(204);
	res = await server.inject({ url: "/api/tags", method: "GET", cookies });
	expect(res.statusCode).toBe(200);
	expect(res.json()).toEqual([]);
});

test("simple config with 2 peers", async () => {
	const { privateKey: peer1PrivKey, publicKey: peer1PubKey } = await generateKeys();
	const { privateKey: peer2PrivKey, publicKey: peer2PubKey } = await generateKeys();
	const presharedKey = generate32BytesKey();
	const id1 = await createPeer({ name: "peer-1", privateKey: formatBase64(extractKey(peer1PrivKey)) });
	await addIp(id1, "10.0.0.1", { netmask: 30 });
	const id2 = await createPeer({ name: "peer-2", privateKey: formatBase64(extractKey(peer2PrivKey)) });
	await addIp(id2, "10.0.0.2", { netmask: 30 });
	await addEndpoint(id1, "192.168.1.15:6432", { priority: 1 });
	await linkPeers(id1, id2, { presharedKey: formatBase64(presharedKey) });
	await expectConfig(id1, {
		address: ["10.0.0.1/30"],
		privateKey: extractKey(peer1PrivKey),
		peers: [{ publicKey: extractKey(peer2PubKey), presharedKey, allowedIPs: ["10.0.0.2/32"] }],
	});
	await expectConfig(id2, {
		address: ["10.0.0.2/30"],
		privateKey: extractKey(peer2PrivKey),
		peers: [{ publicKey: extractKey(peer1PubKey), presharedKey, allowedIPs: ["10.0.0.1/32"], endpoint: "192.168.1.15:6432" }],
	});
});

test("simple config with 3 peers and different tags", async () => {
	const { privateKey: peer1PrivKey, publicKey: peer1PubKey } = await generateKeys();
	const { privateKey: peer2PrivKey, publicKey: peer2PubKey } = await generateKeys();
	const { privateKey: peer3PrivKey, publicKey: peer3PubKey } = await generateKeys();
	const presharedKey12 = generate32BytesKey();
	const presharedKey13 = generate32BytesKey();
	const id1 = await createPeer({ name: "peer-1", privateKey: formatBase64(extractKey(peer1PrivKey)) });
	await addIp(id1, "10.0.0.1", { netmask: 24 });
	const id2 = await createPeer({ name: "peer-2", privateKey: formatBase64(extractKey(peer2PrivKey)) });
	await addIp(id2, "10.0.0.2", { netmask: 24 });
	const id3 = await createPeer({ name: "peer-3", privateKey: formatBase64(extractKey(peer3PrivKey)) });
	await addIp(id3, "10.0.0.3", { netmask: 24 });
	const tag1 = await createTag({ name: "tag1" });
	await setPeerTags(id2, [tag1]);
	await addEndpoint(id1, "172.193.34.21:7432", { priority: 1 });
	await addEndpoint(id1, "192.168.1.16:7432", { priority: 2, peerCondition: JSON.stringify(pcTag(tag1)) });
	await linkPeers(id1, id2, { presharedKey: formatBase64(presharedKey12) });
	await linkPeers(id1, id3, { presharedKey: formatBase64(presharedKey13) });
	await expectConfig(id1, {
		address: ["10.0.0.1/24"],
		privateKey: extractKey(peer1PrivKey),
		peers: [
			{ publicKey: extractKey(peer2PubKey), presharedKey: presharedKey12, allowedIPs: ["10.0.0.2/32"] },
			{ publicKey: extractKey(peer3PubKey), presharedKey: presharedKey13, allowedIPs: ["10.0.0.3/32"] },
		],
	});
	await expectConfig(id2, {
		address: ["10.0.0.2/24"],
		privateKey: extractKey(peer2PrivKey),
		peers: [{ publicKey: extractKey(peer1PubKey), presharedKey: presharedKey12, allowedIPs: ["10.0.0.1/32"], endpoint: "192.168.1.16:7432" }],
	});
	await expectConfig(id3, {
		address: ["10.0.0.3/24"],
		privateKey: extractKey(peer3PrivKey),
		peers: [{ publicKey: extractKey(peer1PubKey), presharedKey: presharedKey13, allowedIPs: ["10.0.0.1/32"], endpoint: "172.193.34.21:7432" }],
	});
});
