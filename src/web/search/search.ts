import { faPlusCircle, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import type { PeerInfo } from "../../node/database/requests/getAllPeers";
import type { TagInfo } from "../../node/database/requests/getAllTags";
import { allPeersByNameMap$, allPeersByPublicKeyMap$, allPeersFuse$, allTagsByNameMap$, allTagsFuse$ } from "../data";
import { createAutoCompleteLogic } from "../generic/autoCompleteLogic";
import { addPeer, addTag } from "../requests";

export interface ItemWithScore<T> {
	item: T;
	score: number;
}

const createExcludeVersion =
	<T extends { id: number }>(searchFn: (searchText: string) => ItemWithScore<T>[]) =>
	(exclude: number[]) => {
		if (exclude.length === 0) {
			return searchFn;
		}
		const excluded = new Set(exclude);
		return (searchText: string) => searchFn(searchText).filter((item) => !excluded.has(item.item.id));
	};

const publicKeyRegExp = /^[0-9a-z+/]{43}=$/i;
export const searchPeers = (searchText: string): ItemWithScore<PeerInfo>[] => {
	if (!searchText) {
		return [];
	}
	let res = allPeersFuse$().search(searchText) as ItemWithScore<PeerInfo>[];
	const publicKeyMatch = publicKeyRegExp.test(searchText) && allPeersByPublicKeyMap$()[searchText];
	if (publicKeyMatch) {
		const excluded = new Set(publicKeyMatch.map(({ id }) => id));
		res = res.filter((item) => !excluded.has(item.item.id));
		res.unshift(...publicKeyMatch.map((item) => ({ item, score: 0 })));
	}
	return res;
};
export const searchPeersExclude = createExcludeVersion(searchPeers);
export const searchTags = (searchText: string): ItemWithScore<TagInfo>[] => (searchText ? (allTagsFuse$().search(searchText) as any) : []);
export const searchTagsExclude = createExcludeVersion(searchTags);

export interface TagSearchResult extends ItemWithScore<TagInfo> {
	type: "tag";
}

export interface PeerSearchResult extends ItemWithScore<PeerInfo> {
	type: "peer";
}

export interface GenericItem {
	href?: string;
	handler?: () => void;
	icon: IconDefinition;
	text: string;
	title?: string;
}

export interface GenericSearchResult extends ItemWithScore<GenericItem> {
	type: "generic";
}

export type SearchResult = GenericSearchResult | PeerSearchResult | TagSearchResult;

const sortByScore = ({ score: score1 }: ItemWithScore<any>, { score: score2 }: ItemWithScore<any>) => score1 - score2;

const { getSuggestions$, inputDirective, hasFocusDirective, navManagerDirective, text$, showSuggestions$, suggestions$, closeSuggestions } = createAutoCompleteLogic<SearchResult>();

export { closeSuggestions, hasFocusDirective, inputDirective, navManagerDirective, showSuggestions$, suggestions$, text$ };

getSuggestions$.set((searchText) => {
	const res: SearchResult[] = [];
	if (searchText) {
		const lowerCaseSearchText = searchText.toLocaleLowerCase();
		if (!allPeersByNameMap$()[lowerCaseSearchText]) {
			res.push({
				type: "generic",
				item: {
					text: `Create a "${searchText}" peer`,
					icon: faPlusCircle,
					handler: addPeer.bind(null, searchText),
				},
				score: 0,
			});
		}
		if (!allTagsByNameMap$()[lowerCaseSearchText]) {
			res.push({
				type: "generic",
				item: {
					text: `Create a "${searchText}" tag`,
					icon: faPlusCircle,
					handler: addTag.bind(null, searchText),
				},
				score: 0,
			});
		}
		res.push(
			...searchPeers(searchText).map(
				(result): PeerSearchResult => ({
					...result,
					type: "peer",
				}),
			),
			...searchTags(searchText).map(
				(result): TagSearchResult => ({
					...result,
					type: "tag",
				}),
			),
		);
		res.sort(sortByScore);
	}
	return res;
});
