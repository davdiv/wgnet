import type { SimpleCondition } from "./evaluate";
import { ComposedConditionType, SimpleConditionType, isPeerIdCondition, isSimpleCondition, type PeerCondition } from "./evaluate";

const swapAndAndOr = (operator: ComposedConditionType.And | ComposedConditionType.Or) => (operator === ComposedConditionType.And ? ComposedConditionType.Or : ComposedConditionType.And);

const simpleConditionsList = (operator: ComposedConditionType.And | ComposedConditionType.Or) => {
	const tags = new Set<number>();
	const peerIds = new Set<number>();
	const oppositeTags = new Set<number>();
	const oppositePeerIds = new Set<number>();
	return {
		addCondition(condition: SimpleCondition, opposite = false): PeerCondition | undefined {
			const isPeerId = isPeerIdCondition(condition);
			const id = condition[1];
			const mainSet = isPeerId ? peerIds : tags;
			const oppositeSet = isPeerId ? oppositePeerIds : oppositeTags;
			const setToUse = opposite ? oppositeSet : mainSet;
			const oppositeToSetToUse = opposite ? mainSet : oppositeSet;
			setToUse.add(id);
			if (oppositeToSetToUse.has(id)) {
				// AND(A,NOT(A)) = false = OR()
				// OR(A,NOT(A)) = true = AND()
				return [swapAndAndOr(operator)];
			}
			if (isPeerId && operator === ComposedConditionType.And && peerIds.size > 1) {
				// multiple peer ids at the same time: false = OR()
				return [ComposedConditionType.Or];
			}
		},
		conditions: () => [
			...[...tags].map((value): PeerCondition => [SimpleConditionType.Tag, value]),
			...[...oppositeTags].map((value): PeerCondition => [ComposedConditionType.Not, [SimpleConditionType.Tag, value]]),
			...[...peerIds].map((value): PeerCondition => [SimpleConditionType.PeerId, value]),
			...[...oppositePeerIds].map((value): PeerCondition => [ComposedConditionType.Not, [SimpleConditionType.PeerId, value]]),
		],
	};
};

export const simplifyPeerCondition = (peerCondition: PeerCondition): PeerCondition => {
	// TODO: we could probably better simplify some expressions
	// for example: AND(A,OR(A,B)) = A and also OR(A,AND(A,B)) = A
	// and OR(A,AND(NOT A,B)) = OR(A,B) and also AND(A,OR(NOT A,B)) = AND(A,B)
	// ...
	if (isSimpleCondition(peerCondition)) {
		return peerCondition;
	}
	let operator = peerCondition[0];
	if (operator === ComposedConditionType.Not) {
		const operand = peerCondition[1];
		if (isSimpleCondition(operand)) {
			return [ComposedConditionType.Not, operand];
		}
		operator = operand[0];
		if (operator === ComposedConditionType.Not) {
			// NOT(NOT(x)) = x
			return simplifyPeerCondition(operand[1]);
		}
		// NOT(AND(a,b)) = OR(NOT(a),NOT(b))
		// NOT(OR(a,b)) = AND(NOT(a),NOT(b))
		return simplifyPeerCondition([swapAndAndOr(operator), ...operand.slice(1).map((item) => [ComposedConditionType.Not, item] as PeerCondition)]);
	}
	if (peerCondition.length === 2) {
		// AND or OR with a single operand is like the operand alone
		return simplifyPeerCondition(peerCondition[1]);
	}
	const expressions: PeerCondition[] = [];
	const simpleList = simpleConditionsList(operator);
	const operands = peerCondition.slice(1) as PeerCondition[];
	for (let i = 0; i < operands.length; i++) {
		const operand = simplifyPeerCondition(operands[i]);
		if (isSimpleCondition(operand)) {
			const res = simpleList.addCondition(operand);
			if (res) {
				return res;
			}
		} else if (operand[0] === ComposedConditionType.Not && isSimpleCondition(operand[1])) {
			const res = simpleList.addCondition(operand[1], true);
			if (res) {
				return res;
			}
		} else if (operand[0] === operator) {
			operands.splice(i, 1, ...(operand.slice(1) as PeerCondition[]));
			i--;
		} else if (operand.length === 1 && operand[0] === swapAndAndOr(operator)) {
			// AND(OR(),...) = AND(false,...) = false = OR()
			// OR(AND(),...) = OR(true,...) = true = AND()
			return operand;
		} else {
			expressions.push(operand);
		}
	}
	expressions.unshift(...simpleList.conditions());
	return expressions.length === 1 ? expressions[0] : [operator, ...expressions];
};
