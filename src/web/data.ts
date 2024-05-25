import type { WritableSignal } from "@amadeus-it-group/tansu";
import { asReadable, computed, untrack, writable } from "@amadeus-it-group/tansu";
import Fuse from "fuse.js";
import { DataSet } from "vis-data";
import { promiseStoreToValueStore } from "../common/promiseToStore";
import type { PeerLinkInfo } from "../node/database/requests/getAllPeerLinks";
import { getAllPeerLinks, getAllPeers, getAllTags } from "./requests";

const _refresh$ = writable({});
export const refresh = () => _refresh$.set({});
export const refresh$ = asReadable(_refresh$);

const updateSelected = <T extends number | string>(dataSet: DataSet<any, any>, selectedItems$: WritableSignal<T[]>) =>
	untrack(() => {
		let diff = false;
		const newSelectedItems = selectedItems$().filter((item) => {
			const present = !!dataSet.get(item);
			if (!present) {
				diff = true;
			}
			return present;
		});
		if (diff) {
			selectedItems$.set(newSelectedItems);
		}
	});

const getIdProperty = <T extends { id: number }>(item: T) => item.id;
const getLowerCaseNameProperty = <T extends { name: string }>(item: T) => [item.name.toLowerCase()];

const toMap = <T, K extends string | number>(array: T[], getId: (item: T) => K) => {
	const map: Record<K, T> = {} as any;
	for (const peer of array) {
		map[getId(peer)] = peer;
	}
	return map;
};
const toMapMultiple = <T, K extends string | number>(array: T[], getValues: (item: T) => K[]) => {
	const map: Record<K, T[]> = {} as any;
	const getItemArray = (id: K) => {
		let res = map[id];
		if (!res) {
			res = [];
			map[id] = res;
		}
		return res;
	};
	for (const item of array) {
		for (const id of getValues(item)) {
			getItemArray(id).push(item);
		}
	}
	return map;
};

export const allPeersPromise$ = computed(() => {
	refresh$();
	return untrack(getAllPeers);
});

export const allPeers$ = promiseStoreToValueStore(allPeersPromise$, []);
export const allPeersFuse$ = computed(
	() =>
		new Fuse(allPeers$(), {
			includeScore: true,
			ignoreLocation: true,
			useExtendedSearch: true,
			keys: ["name", "description", "addresses.ip"],
		}),
);
export const allPeersMap$ = computed(() => toMap(allPeers$(), getIdProperty));
export const allPeersByNameMap$ = computed(() => toMapMultiple(allPeers$(), getLowerCaseNameProperty));
const getPublicKey = ({ publicKey }: { publicKey: string | null }) => (publicKey ? [publicKey] : []);
export const allPeersByPublicKeyMap$ = computed(() => toMapMultiple(allPeers$(), getPublicKey));
export const allPeersDataSet$ = computed(() => {
	const res = new DataSet<{ id: number; label: string }>(allPeers$().map(({ id, name, addresses }) => ({ id, label: `${name}\n${addresses.map((address) => address.ip).join("\n")}` })));
	updateSelected(res, selectedPeers$);
	return res;
});
const getTags = ({ tags }: { tags: number[] }) => tags;
export const allPeersTagMap$ = computed(() => toMapMultiple(allPeers$(), getTags));

export const allPeerLinksPromise$ = computed(() => {
	refresh$();
	return untrack(getAllPeerLinks);
});

export const allPeerLinks$ = promiseStoreToValueStore(allPeerLinksPromise$, []);
const getPeerLinkId = (peerLink: PeerLinkInfo) => `${peerLink.peer1}-${peerLink.peer2}`;
export const allPeerLinksDataSet$ = computed(() => {
	const res = new DataSet<{ id: string; from: number; to: number; label: string }>(
		allPeerLinks$().map((peerLink) => ({ id: getPeerLinkId(peerLink), from: peerLink.peer1, to: peerLink.peer2, label: peerLink.hasPSK ? "\ud83d\udd12" : "" })),
	);
	updateSelected(res, selectedPeerLinks$);
	return res;
});
export const allPeerLinksMap$ = computed(() => toMap(allPeerLinks$(), getPeerLinkId));
export const allPeerLinksPeerMap$ = computed(() => {
	const map: Record<number, number[]> = {} as any;
	const getItemArray = (id: number) => {
		let res = map[id];
		if (!res) {
			res = [];
			map[id] = res;
		}
		return res;
	};
	for (const { peer1, peer2 } of allPeerLinks$()) {
		getItemArray(peer1).push(peer2);
		getItemArray(peer2).push(peer1);
	}
	return map;
});

export const allTagsPromise$ = computed(() => {
	refresh$();
	return untrack(getAllTags);
});
export const allTags$ = promiseStoreToValueStore(allTagsPromise$, []);
export const allTagsFuse$ = computed(
	() =>
		new Fuse(allTags$(), {
			includeScore: true,
			ignoreLocation: true,
			keys: ["name", "description"],
		}),
);
export const allTagsMap$ = computed(() => toMap(allTags$(), getIdProperty));
export const allTagsByNameMap$ = computed(() => toMapMultiple(allTags$(), getLowerCaseNameProperty));

export const selectedPeers$ = writable([] as number[]);
export const selectedPeerLinks$ = writable([] as string[]);
