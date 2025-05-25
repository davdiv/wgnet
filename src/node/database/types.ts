import type { IPAddress } from "../../common/ip";
import type { BinaryKey } from "../../common/keys";

export const jsonSchema = <T>(json: T) => ({ type: "object", properties: json });

const typeString = { type: "string" };
const typeNumber = { type: "number" };
const typeStringOrNull = { type: ["string", "null"], default: null };
const typeNumberOrNull = { type: ["number", "null"], default: null };
const typePeerCondition = { type: ["string", "null"], default: null, format: "peerCondition" };
const typeColorOrNull = { type: ["string", "null"], default: null, format: "color" };
const typeNumberArrayOrNull = { type: ["array", "null"], items: { type: "integer" }, default: null };

export interface DBPeer {
	id: number;
	name: string;
	description: string | null;
	tags: string | null;
	interfaceName: string | null;
	listenPort: number | null;
	fwMark: number | null;
	publicKey: BinaryKey | null;
	privateKey: BinaryKey | null;
}
export interface DBPeerExposed extends Omit<DBPeer, "tags"> {
	tags: number[] | null;
}

export const dbPeerKeySchema = {
	id: typeNumber,
};
export const dbPeerSecSchema = {
	publicKey: typeStringOrNull,
	privateKey: typeStringOrNull,
	tags: typeNumberArrayOrNull,
};
export const dbPeerNonKeyNonSecSchema = {
	name: typeString,
	description: typeStringOrNull,
	interfaceName: typeStringOrNull,
	listenPort: typeNumberOrNull,
	fwMark: typeNumberOrNull,
};
export const dbPeerNonKeySchema = {
	...dbPeerNonKeyNonSecSchema,
	...dbPeerSecSchema,
};
export const dbPeerSchema = {
	...dbPeerKeySchema,
	...dbPeerNonKeySchema,
};

export type DBPeerKey = Pick<DBPeer, "id">;
export type DBNewPeer = Omit<DBPeer, "id">;
export type DBNewPeerExposed = Omit<DBPeerExposed, "id">;

export interface DBTag {
	id: number;
	name: string;
	description: string | null;
	color: string | null;
}

export const dbTagKeySchema = {
	id: typeNumber,
};
export const dbTagNonKeySchema = {
	name: typeString,
	description: typeStringOrNull,
	color: typeColorOrNull,
};
export const dbTagSchema = {
	...dbTagKeySchema,
	...dbTagNonKeySchema,
};

export type DBTagKey = Pick<DBTag, "id">;
export type DBNewTag = Omit<DBTag, "id">;

export interface DBPeerLink {
	peer1: number;
	peer2: number;
	presharedKey: BinaryKey | null;
}

export const dbPeerLinkKeySchema = {
	peer1: typeNumber,
	peer2: typeNumber,
};
export const dbPeerLinkNonKeySchema = {
	presharedKey: typeStringOrNull,
};
export const dbPeerLinkSchema = {
	...dbPeerLinkKeySchema,
	...dbPeerLinkNonKeySchema,
};

export type DBPeerLinkKey = Pick<DBPeerLink, "peer1" | "peer2">;
export type DBNewPeerLink = DBPeerLink;

export interface DBPeerIp {
	peer: number;
	ip: IPAddress;
	netmask: number;
	peerCondition: string | null;
}

export const dbPeerIpKeySchema = {
	peer: typeNumber,
	ip: typeString,
	netmask: typeNumber,
};
export const dbPeerIpNonKeySchema = {
	peerCondition: typePeerCondition,
};
export const dbPeerIpSchema = {
	...dbPeerIpKeySchema,
	...dbPeerIpNonKeySchema,
};

export type DBPeerIpKey = Pick<DBPeerIp, "peer" | "ip">;
export type DBNewPeerIp = DBPeerIp;

export interface DBPeerEndpoint {
	peer: number;
	endpoint: string;
	priority: number;
	peerCondition: string | null;
}

export const dbPeerEndpointKeySchema = {
	peer: typeNumber,
	endpoint: typeString,
};
export const dbPeerEndpointNonKeySchema = {
	priority: typeNumber,
	peerCondition: typePeerCondition,
};
export const dbPeerEndpointSchema = {
	...dbPeerEndpointKeySchema,
	dbPeerEndpointNonKeySchema,
};

export type DBPeerEndpointKey = Pick<DBPeerEndpoint, "peer" | "endpoint">;
export type DBNewPeerEndpoint = DBPeerEndpoint;

export interface DBPeerAllowedIp {
	peer: number;
	ip: IPAddress;
	netmask: number;
	peerCondition: string | null;
}

export const dbPeerAllowedIpKeySchema = {
	peer: typeNumber,
	ip: typeString,
	netmask: typeNumber,
};
export const dbPeerAllowedIpNonKeySchema = {
	peerCondition: typePeerCondition,
};
export const dbPeerAllowedIpSchema = {
	...dbPeerAllowedIpKeySchema,
	...dbPeerAllowedIpNonKeySchema,
};

export type DBPeerAllowedIpKey = Pick<DBPeerIp, "peer" | "ip" | "netmask">;
export type DBNewPeerAllowedIp = DBPeerAllowedIp;

export type StringifyBinaryItem<T> = T extends Buffer ? string : T extends Uint8Array ? string : T;
export type AcceptStringifiedBinary<T extends object> = {
	[K in keyof T]: T[K] | StringifyBinaryItem<T[K]>;
};
export type StringifiedBinary<T extends object> = {
	[K in keyof T]: StringifyBinaryItem<T[K]>;
};
