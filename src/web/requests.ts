import type { WgConfig } from "../common/wgConfig/type";
import type { PeerLinkInfo } from "../node/database/requests/getAllPeerLinks";
import type { PeerInfo } from "../node/database/requests/getAllPeers";
import type { TagInfo } from "../node/database/requests/getAllTags";
import type {
	DBPeer,
	DBPeerAllowedIp,
	DBPeerAllowedIpKey,
	DBPeerEndpoint,
	DBPeerEndpointKey,
	DBPeerIp,
	DBPeerIpKey,
	DBPeerLink,
	DBPeerLinkKey,
	DBPeerTag,
	DBPeerTagKey,
	DBTag,
	StringifiedBinary,
	dbPeerNonKeyNonSecSchema,
} from "../node/database/types";
import { refresh } from "./data";
import { navigate } from "./router/locationStore";
import { ToastType, addToast } from "./toasts/toasts";

const jsonHeaders = { "Content-Type": "application/json" };

const callFetch = async <T>(url: string, action: string, init?: RequestInit) => {
	let res;
	try {
		res = await fetch(url, init);
	} catch (error: any) {
		addToast(`Error while ${action}: ${error?.message ?? error}`, ToastType.error);
		throw error;
	}
	if (!res.ok) {
		if (res.status === 403) {
			const text = await res.text();
			addToast(`Error while ${action}: ${text}`, ToastType.error);
			throw new Error(text);
		}
		const error = await res.json();
		addToast(`Error while ${action}: ${error.message}`, ToastType.error);
		throw error;
	}
	return res.status != 204 ? ((await res.json()) as T) : (undefined as T);
};

const dataFetch =
	<T>(url: string, action: string) =>
	async () =>
		await callFetch<T>(url, action);

export const getAllPeers = dataFetch<PeerInfo[]>("/api/peers", "retrieving the list of peers");
export const getAllPeerLinks = dataFetch<PeerLinkInfo[]>("/api/peerLinks", "retrieving the list of peer links");
export const getAllTags = dataFetch<TagInfo[]>("/api/tags", "retrieving the list of tags");

export const getPeerPrivateKey = async (id: number) => (await callFetch<Pick<StringifiedBinary<DBPeer>, "privateKey">>(`/api/peers/${id}/privateKey`, "retrieving private key")).privateKey;
export const setPeerPrivateKey = async (id: number, privateKey: string | null, name: string) => {
	await callFetch(`/api/peers/${id}/privateKey`, `setting key of ${name}`, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify({ privateKey }),
	});
	addToast(`The key of ${name} was changed successfully.`, ToastType.success);
	refresh();
};
export const setPeerPublicKey = async (id: number, publicKey: string | null, name: string) => {
	await callFetch(`/api/peers/${id}/publicKey`, `setting key of ${name}`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify({ publicKey }),
	});
	addToast(`The key of ${name} was changed successfully.`, ToastType.success);
	refresh();
};
export const getPeerConfig = async (id: number) => await callFetch<WgConfig>(`/api/peers/${id}/config`, "retrieving peer configuration");

export const addPeer = async (name: string) => {
	const { id } = await callFetch<{ id: number }>("/api/peers", `creating peer ${JSON.stringify(name)}`, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify({
			name,
			privateKey: "generate",
		}),
	});
	addToast(`Peer ${name} was successfully created.`, ToastType.success);
	refresh();
	navigate(`/peers/${id}`);
};

export const updatePeer = async ({ id, ...peer }: Pick<StringifiedBinary<DBPeer>, "id" | keyof typeof dbPeerNonKeyNonSecSchema>) => {
	await callFetch(`/api/peers/${id}`, `updating peer ${peer.name}`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify(peer),
	});
	addToast(`Peer ${peer.name} was successfully updated.`, ToastType.success);
	refresh();
};

export const removePeer = async (id: number, name: string) => {
	await callFetch(`/api/peers/${id}`, `removing peer ${name}`, {
		method: "DELETE",
	});
	addToast(`Peer ${name} was successfully removed.`, ToastType.success);
	refresh();
};

export const addTag = async (name: string) => {
	const { id } = await callFetch<{ id: number }>("/api/tags", `creating tag ${JSON.stringify(name)}`, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify({
			name,
		}),
	});
	addToast(`Tag ${name} was successfully created.`, ToastType.success);
	refresh();
	navigate(`/tags/${id}`);
};

export const updateTag = async ({ id, ...tag }: StringifiedBinary<DBTag>) => {
	await callFetch(`/api/tags/${id}`, `updating tag ${tag.name}`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify(tag),
	});
	addToast(`Tag ${tag.name} was successfully updated.`, ToastType.success);
	refresh();
};

export const removeTag = async (id: number, name: string) => {
	await callFetch(`/api/tags/${id}`, `removing tag ${name}`, {
		method: "DELETE",
	});
	addToast(`Tag ${name} was successfully removed.`, ToastType.success);
	refresh();
};

export const attachTag = async (peer: number, tag: number, peerName: string, tagName: string) => {
	await callFetch(`/api/peers/${peer}/tags/${tag}`, `attaching tag ${tagName} to peer ${peerName}`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify({} as Omit<StringifiedBinary<DBPeerTag>, keyof DBPeerTagKey>),
	});
	addToast(`Tag ${tagName} was successfully attached to peer ${peerName}.`, ToastType.success);
	refresh();
};

export const detachTag = async (peer: number, tag: number, peerName: string, tagName: string) => {
	await callFetch(`/api/peers/${peer}/tags/${tag}`, `detaching tag ${tagName} from peer ${peerName}`, {
		method: "DELETE",
	});
	addToast(`Tag ${tagName} was successfully detached from peer ${peerName}.`, ToastType.success);
	refresh();
};

export const createPeerLinkId = (peer1: number, peer2: number) => {
	if (peer1 > peer2) {
		[peer1, peer2] = [peer2, peer1];
	}
	return `${peer1}-${peer2}`;
};

export const upsertPeerLink = async (peerLinkId: string, presharedKey: string | null) => {
	await callFetch(`/api/peerLinks/${peerLinkId}`, `configuring peer link`, {
		method: "POST",
		headers: jsonHeaders,
		body: JSON.stringify({
			presharedKey,
		} as Omit<StringifiedBinary<DBPeerLink>, keyof DBPeerLinkKey>),
	});
	addToast("Peer link was successfully configured.", ToastType.success);
	refresh();
};

export const removePeerLink = async (peerLinkId: string) => {
	await callFetch(`/api/peerLinks/${peerLinkId}`, `removing peer link`, {
		method: "DELETE",
	});
	addToast("Peer link was successfully removed.", ToastType.success);
	refresh();
};

export const getPeerLinkPresharedKey = async (peerLinkId: string) =>
	(await callFetch<Pick<StringifiedBinary<DBPeerLink>, "presharedKey">>(`/api/peerLinks/${peerLinkId}/presharedKey`, "retrieving preshared key")).presharedKey;

export const addPeerIp = async ({ peer, ip, ...body }: StringifiedBinary<DBPeerIp>) => {
	await callFetch(`/api/peers/${peer}/ips/${ip}`, `configuring IP address`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify(body),
	});
	addToast("IP address was successfully configured.", ToastType.success);
	refresh();
};

export const removePeerIp = async ({ peer, ip }: StringifiedBinary<DBPeerIpKey>) => {
	await callFetch(`/api/peers/${peer}/ips/${ip}`, `removing IP address`, {
		method: "DELETE",
	});
	addToast("IP address was successfully removed.", ToastType.success);
	refresh();
};

export const addPeerAllowedIp = async ({ peer, ip, netmask, ...body }: StringifiedBinary<DBPeerAllowedIp>) => {
	await callFetch(`/api/peers/${peer}/allowedIPs/${ip}/${netmask}`, `configuring peer allowed ip`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify(body),
	});
	addToast("Allowed IP was successfully configured.", ToastType.success);
	refresh();
};

export const removePeerAllowedIp = async ({ peer, ip, netmask }: StringifiedBinary<DBPeerAllowedIpKey>) => {
	await callFetch(`/api/peers/${peer}/allowedIPs/${ip}/${netmask}`, `removing peer allowed ip`, {
		method: "DELETE",
	});
	addToast("Allowed IP was successfully removed.", ToastType.success);
	refresh();
};

export const addPeerEndpoint = async ({ peer, endpoint, ...body }: StringifiedBinary<DBPeerEndpoint>) => {
	await callFetch(`/api/peers/${peer}/endpoints/${endpoint}`, `configuring peer endpoint`, {
		method: "PUT",
		headers: jsonHeaders,
		body: JSON.stringify(body),
	});
	addToast("Endpoint was successfully configured.", ToastType.success);
	refresh();
};

export const removePeerEndpoint = async ({ peer, endpoint }: StringifiedBinary<DBPeerEndpointKey>) => {
	await callFetch(`/api/peers/${peer}/endpoints/${endpoint}`, `removing peer allowed ip`, {
		method: "DELETE",
	});
	addToast("Endpoint was successfully removed.", ToastType.success);
	refresh();
};
