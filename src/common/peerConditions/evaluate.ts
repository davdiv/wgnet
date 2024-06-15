export const enum SimpleConditionType {
	Tag = "t",
	PeerId = "p",
}

export const enum ComposedConditionType {
	And = "a",
	Or = "o",
	Not = "n",
}

export type TagCondition = [SimpleConditionType.Tag, number];
export type PeerIdCondition = [SimpleConditionType.PeerId, number];
export type SimpleCondition = TagCondition | PeerIdCondition;
export type AndOperation = [ComposedConditionType.And, ...conditions: PeerCondition[]];
export type OrOperation = [ComposedConditionType.Or, ...conditions: PeerCondition[]];
export type NotOperation = [ComposedConditionType.Not, condition: PeerCondition];
export type ComposedCondition = AndOperation | OrOperation | NotOperation;

export type PeerCondition = SimpleCondition | ComposedCondition;

export const isTagCondition = (peerCondition: PeerCondition): peerCondition is TagCondition => peerCondition[0] === SimpleConditionType.Tag;
export const isPeerIdCondition = (peerCondition: PeerCondition): peerCondition is PeerIdCondition => peerCondition[0] === SimpleConditionType.PeerId;
export const isSimpleCondition = (peerCondition: PeerCondition): peerCondition is SimpleCondition => isTagCondition(peerCondition) || isPeerIdCondition(peerCondition);

export const evaluateCondition = (peerCondition: PeerCondition, peerTags: Set<number>, peerId: number): boolean => {
	switch (peerCondition[0]) {
		case SimpleConditionType.PeerId:
			return peerCondition[1] === peerId;
		case SimpleConditionType.Tag:
			return peerTags.has(peerCondition[1]);
		case ComposedConditionType.And:
			for (let i = 1, l = peerCondition.length; i < l; i++) {
				if (!evaluateCondition(peerCondition[i] as PeerCondition, peerTags, peerId)) {
					return false;
				}
			}
			return true;
		case ComposedConditionType.Or:
			for (let i = 1, l = peerCondition.length; i < l; i++) {
				if (evaluateCondition(peerCondition[i] as PeerCondition, peerTags, peerId)) {
					return true;
				}
			}
			return false;
		case ComposedConditionType.Not:
			return !evaluateCondition(peerCondition[1], peerTags, peerId);
	}
};

export const matchPeerCondition = (strPeerCondition: string | null, strPeerTags: string, peerId: number) => {
	if (!strPeerCondition) {
		return 1;
	}
	const peerCondition: PeerCondition = JSON.parse(strPeerCondition);
	const peerTags = new Set<number>(JSON.parse(strPeerTags));
	return evaluateCondition(peerCondition, peerTags, peerId) ? 1 : 0;
};
