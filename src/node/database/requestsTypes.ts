export interface RequestsTypes {
	addPeer: ReturnType<typeof import("./requests/addPeer").default>;
	addTag: ReturnType<typeof import("./requests/addTag").default>;
	deletePeer: ReturnType<typeof import("./requests/deletePeer").default>;
	deletePeerAllowedIp: ReturnType<typeof import("./requests/deletePeerAllowedIp").default>;
	deletePeerEndpoint: ReturnType<typeof import("./requests/deletePeerEndpoint").default>;
	deletePeerIp: ReturnType<typeof import("./requests/deletePeerIp").default>;
	deletePeerLink: ReturnType<typeof import("./requests/deletePeerLink").default>;
	deletePeerTag: ReturnType<typeof import("./requests/deletePeerTag").default>;
	deleteTag: ReturnType<typeof import("./requests/deleteTag").default>;
	getAllPeerLinks: ReturnType<typeof import("./requests/getAllPeerLinks").default>;
	getAllPeers: ReturnType<typeof import("./requests/getAllPeers").default>;
	getAllTags: ReturnType<typeof import("./requests/getAllTags").default>;
	getPeerConfig: ReturnType<typeof import("./requests/getPeerConfig").default>;
	getPeerConfigPeers: ReturnType<typeof import("./requests/getPeerConfigPeers").default>;
	getPeerLinkPresharedKey: ReturnType<typeof import("./requests/getPeerLinkPresharedKey").default>;
	getPeerPrivateKey: ReturnType<typeof import("./requests/getPeerPrivateKey").default>;
	setPeerKeys: ReturnType<typeof import("./requests/setPeerKeys").default>;
	updatePeer: ReturnType<typeof import("./requests/updatePeer").default>;
	updateTag: ReturnType<typeof import("./requests/updateTag").default>;
	upsertPeerAllowedIp: ReturnType<typeof import("./requests/upsertPeerAllowedIp").default>;
	upsertPeerEndpoint: ReturnType<typeof import("./requests/upsertPeerEndpoint").default>;
	upsertPeerIp: ReturnType<typeof import("./requests/upsertPeerIp").default>;
	upsertPeerLink: ReturnType<typeof import("./requests/upsertPeerLink").default>;
	upsertPeerTag: ReturnType<typeof import("./requests/upsertPeerTag").default>;
}
