import { asWritable, computed, writable } from "@amadeus-it-group/tansu";
import { createPeerConditionLogic } from "../objects/peerConditions/peerConditionLogic";
import { navigate } from "../router/locationStore";

export const createSearchLogic = () => {
	const matchParams$ = writable({ query: "" });
	const query$ = asWritable(
		computed(() => decodeURIComponent(matchParams$().query ?? "")),
		(value: string | null) => navigate(`/search/${encodeURIComponent(value ?? "")}`, true),
	);
	return { matchParams$, ...createPeerConditionLogic(query$) };
};
