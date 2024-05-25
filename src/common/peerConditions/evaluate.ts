export const enum Operator {
	And = 1,
	Or = 2,
	Not = 3,
}

export type AndOperation = [Operator.And, ...conditions: PeerCondition[]];
export type OrOperation = [Operator.Or, ...conditions: PeerCondition[]];
export type NotOperation = [Operator.Not, condition: PeerCondition];
export type PeerCondition = number | AndOperation | OrOperation | NotOperation;

export const evaluateCondition = (peerCondition: PeerCondition, peerTags: Set<number>): boolean => {
	if (typeof peerCondition === "number") {
		return peerTags.has(peerCondition);
	}
	switch (peerCondition[0]) {
		case Operator.And:
			for (let i = 1, l = peerCondition.length; i < l; i++) {
				if (!evaluateCondition(peerCondition[i], peerTags)) {
					return false;
				}
			}
			return true;
		case Operator.Or:
			for (let i = 1, l = peerCondition.length; i < l; i++) {
				if (evaluateCondition(peerCondition[i], peerTags)) {
					return true;
				}
			}
			return false;
		case Operator.Not:
			return !evaluateCondition(peerCondition[1], peerTags);
	}
};

export const matchPeerCondition = (strPeerCondition: string | null, strPeerTags: string) => {
	if (!strPeerCondition) {
		return 1;
	}
	const peerCondition: PeerCondition = JSON.parse(strPeerCondition);
	const peerTags = new Set([...JSON.parse(strPeerTags)]);
	return evaluateCondition(peerCondition, peerTags) ? 1 : 0;
};
