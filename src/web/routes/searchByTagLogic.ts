import { asWritable, computed, writable } from "@amadeus-it-group/tansu";
import { SimpleConditionType, evaluateCondition } from "../../common/peerConditions/evaluate";
import { simplifyPeerCondition } from "../../common/peerConditions/simplify";
import { validateEditedParsedPeerCondition, validateParsedPeerCondition } from "../../common/peerConditions/validate";
import { allPeers$ } from "../data";
import { navigate } from "../router/locationStore";

export const createSearchByTagLogic = () => {
	const matchParams$ = writable({ query: "" });
	const query$ = asWritable(
		computed(() => decodeURIComponent(matchParams$().query)),
		(value) => navigate(`/searchByTag/${encodeURIComponent(value)}`, true),
	);
	const parsedQuery$ = asWritable(
		computed(() => {
			try {
				return JSON.parse(query$());
			} catch (error) {
				return null;
			}
		}),
		(value) => query$.set(JSON.stringify(value)),
	);
	const queryValidForEdition$ = computed(() => validateEditedParsedPeerCondition(parsedQuery$()));
	const queryValidForSearch$ = computed(() => validateParsedPeerCondition(parsedQuery$()));

	const queryForEdition$ = asWritable(
		computed(() => (queryValidForEdition$() ? structuredClone(parsedQuery$()) : [SimpleConditionType.Tag, -1])),
		parsedQuery$.set,
	);
	const simplifiedQuery$ = computed(() => (queryValidForEdition$() ? simplifyPeerCondition(parsedQuery$()) : null));

	const searchResult$ = computed(() => {
		if (!queryValidForSearch$()) {
			return [];
		}
		const peerCondition = simplifiedQuery$();
		if (!peerCondition) {
			return [];
		}
		return allPeers$().filter((peer) => evaluateCondition(peerCondition, new Set(peer.tags), peer.id));
	});

	return { matchParams$, queryValidForSearch$, simplifiedQuery$, queryForEdition$, searchResult$ };
};
