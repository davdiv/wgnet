import type { WritableSignal } from "@amadeus-it-group/tansu";
import { asWritable, computed } from "@amadeus-it-group/tansu";
import { ComposedConditionType, evaluateCondition } from "../../../common/peerConditions/evaluate";
import { simplifyPeerCondition } from "../../../common/peerConditions/simplify";
import { validateEditedParsedPeerCondition, validateParsedPeerCondition } from "../../../common/peerConditions/validate";
import { allPeers$ } from "../../data";

const defaultPeerCondition = () => [ComposedConditionType.And];
const stringifiedDefaultPeerCondition = JSON.stringify(defaultPeerCondition());

export const createPeerConditionLogic = (peerCondition$: WritableSignal<string | null>) => {
	const parsedQuery$ = asWritable(
		computed(() => {
			try {
				const condition = peerCondition$();
				return condition ? JSON.parse(condition) : defaultPeerCondition();
			} catch {
				return null;
			}
		}),
		(value) => {
			const stringified = JSON.stringify(value);
			peerCondition$.set(stringified === stringifiedDefaultPeerCondition ? null : stringified);
		},
	);
	const queryValidForEdition$ = computed(() => validateEditedParsedPeerCondition(parsedQuery$()));
	const queryValidForSearch$ = computed(() => validateParsedPeerCondition(parsedQuery$()));

	const queryForEdition$ = asWritable(
		computed(() => (queryValidForEdition$() ? structuredClone(parsedQuery$()) : defaultPeerCondition())),
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

	return { queryValidForSearch$, simplifiedQuery$, queryForEdition$, searchResult$ };
};
