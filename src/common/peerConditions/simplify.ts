import { Operator, type PeerCondition } from "./evaluate";

const swapAndAndOr = (operator: Operator.And | Operator.Or) => (operator === Operator.And ? Operator.Or : Operator.And);

export const simplifyPeerCondition = (peerCondition: PeerCondition): PeerCondition => {
	// TODO: we could probably better simplify some expressions
	// for example: AND(A,OR(A,B)) = A and also OR(A,AND(A,B)) = A
	// and OR(A,AND(NOT A,B)) = OR(A,B) and also AND(A,OR(NOT A,B)) = AND(A,B)
	// ...
	if (typeof peerCondition === "number") {
		return peerCondition;
	}
	let operator = peerCondition[0];
	if (operator === Operator.Not) {
		const operand = peerCondition[1];
		if (typeof operand === "number") {
			return [Operator.Not, operand];
		}
		operator = operand[0];
		if (operator === Operator.Not) {
			// NOT(NOT(x)) = x
			return simplifyPeerCondition(operand[1]);
		}
		// NOT(AND(a,b)) = OR(NOT(a),NOT(b))
		// NOT(OR(a,b)) = AND(NOT(a),NOT(b))
		return simplifyPeerCondition([swapAndAndOr(operator), ...operand.slice(1).map((item) => [Operator.Not, item] as PeerCondition)]);
	}
	if (peerCondition.length === 2) {
		// AND or OR with a single operand is like the operand alone
		return simplifyPeerCondition(peerCondition[1]);
	}
	const expressions: PeerCondition[] = [];
	const directTags = new Set<number>();
	const oppositeTags = new Set<number>();
	const operands = peerCondition.slice(1);
	for (let i = 0; i < operands.length; i++) {
		const operand = simplifyPeerCondition(operands[i]);
		if (typeof operand === "number") {
			directTags.add(operand);
			if (oppositeTags.has(operand)) {
				// AND(A,NOT(A)) = false = OR()
				// OR(A,NOT(A)) = true = AND()
				return [swapAndAndOr(operator)];
			}
		} else if (operand[0] === Operator.Not && typeof operand[1] === "number") {
			oppositeTags.add(operand[1]);
			if (directTags.has(operand[1])) {
				// AND(A,NOT(A)) = false = OR()
				// OR(A,NOT(A)) = true = AND()
				return [swapAndAndOr(operator)];
			}
		} else if (operand[0] === operator) {
			operands.splice(i, 1, ...operand.slice(1));
			i--;
		} else if (operand.length === 1 && operand[0] === swapAndAndOr(operator)) {
			// AND(OR(),...) = AND(false,...) = false = OR()
			// OR(AND(),...) = OR(true,...) = true = AND()
			return operand;
		} else {
			expressions.push(operand);
		}
	}
	return [operator, ...directTags, ...[...oppositeTags].map((value): PeerCondition => [Operator.Not, value]), ...expressions];
};
