import { describe, expect, test } from "vitest";
import { validatePeerCondition } from "../src/common/peerConditions/validate";
import { Operator, matchPeerCondition } from "../src/common/peerConditions/evaluate";
import { simplifyPeerCondition } from "../src/common/peerConditions/simplify";

describe("validatePeerCondition", () => {
	test("should work", () => {
		expect(validatePeerCondition(null)).toBe(true);
		expect(validatePeerCondition("0")).toBe(false);
		expect(validatePeerCondition("-5")).toBe(false);
		expect(validatePeerCondition("1")).toBe(true);
		expect(validatePeerCondition("5")).toBe(true);
		expect(validatePeerCondition("[0]")).toBe(false);
		expect(validatePeerCondition("[10]")).toBe(false);

		// AND
		expect(validatePeerCondition("[1]")).toBe(true); // empty AND
		expect(validatePeerCondition("[1,2]")).toBe(true);
		expect(validatePeerCondition("[1,2,4]")).toBe(true);
		expect(validatePeerCondition("[1,2,4,7]")).toBe(true);
		expect(validatePeerCondition("[1,2,[2,4,9],7]")).toBe(true);

		// OR
		expect(validatePeerCondition("[2]")).toBe(true); // empty OR
		expect(validatePeerCondition("[2,1]")).toBe(true);
		expect(validatePeerCondition("[2,1,4]")).toBe(true);
		expect(validatePeerCondition("[2,1,4,[1,7,2]]")).toBe(true);

		// NOT:
		expect(validatePeerCondition("[3]")).toBe(false); // empty NOT
		expect(validatePeerCondition("[3,1]")).toBe(true);
		expect(validatePeerCondition("[3,5]")).toBe(true);
		expect(validatePeerCondition("[3,[2,5,6]]")).toBe(true);
		expect(validatePeerCondition("[3,-1]")).toBe(false);
		expect(validatePeerCondition("[3,1,4]")).toBe(false);

		expect(validatePeerCondition("")).toBe(false);
		expect(validatePeerCondition("[")).toBe(false);
		expect(validatePeerCondition('{"0":1}')).toBe(false);
	});
});

describe("matchPeerCondition", () => {
	test("should work", () => {
		expect(matchPeerCondition(null, "[]")).toBe(1);
		expect(matchPeerCondition(null, "[1]")).toBe(1);
		expect(matchPeerCondition("1", "[1]")).toBe(1);
		expect(matchPeerCondition("1", "[]")).toBe(0);
		expect(matchPeerCondition("[1]", "[]")).toBe(1); // empty AND = TRUE
		expect(matchPeerCondition("[2]", "[]")).toBe(0); // empty OR = FALSE
		expect(matchPeerCondition("[1,5,6]", "[]")).toBe(0);
		expect(matchPeerCondition("[3,[1,5,6]]", "[]")).toBe(1);
		expect(matchPeerCondition("[1,5,6]", "[5]")).toBe(0);
		expect(matchPeerCondition("[3,[1,5,6]]", "[5]")).toBe(1);
		expect(matchPeerCondition("[1,5,6]", "[6]")).toBe(0);
		expect(matchPeerCondition("[3,[1,5,6]]", "[6]")).toBe(1);
		expect(matchPeerCondition("[1,5,6]", "[5,6]")).toBe(1);
		expect(matchPeerCondition("[3,[1,5,6]]", "[5,6]")).toBe(0);
		expect(matchPeerCondition("[1,5,6]", "[1,5,6]")).toBe(1);
		expect(matchPeerCondition("[2,5,6]", "[]")).toBe(0);
		expect(matchPeerCondition("[2,5,6]", "[5]")).toBe(1);
		expect(matchPeerCondition("[2,5,6]", "[6]")).toBe(1);
		expect(matchPeerCondition("[2,5,6]", "[5,6]")).toBe(1);
		expect(matchPeerCondition("[3,6]", "[]")).toBe(1);
		expect(matchPeerCondition("[3,6]", "[6]")).toBe(0);
	});
});

describe("simplify", () => {
	test("should work", () => {
		expect(simplifyPeerCondition([Operator.And])).toEqual([Operator.And]); // TRUE
		expect(simplifyPeerCondition([Operator.Or])).toEqual([Operator.Or]); // FALSE
		expect(simplifyPeerCondition([Operator.And, 1, [Operator.Not, 1]])).toEqual([Operator.Or]); // FALSE
		expect(simplifyPeerCondition([Operator.Or, 1, [Operator.Not, 1]])).toEqual([Operator.And]); // TRUE
		expect(simplifyPeerCondition([Operator.And, [Operator.Not, 1], 1])).toEqual([Operator.Or]); // FALSE
		expect(simplifyPeerCondition([Operator.Or, [Operator.Not, 1], 1])).toEqual([Operator.And]); // TRUE
		expect(simplifyPeerCondition([Operator.And, [Operator.Or], 1])).toEqual([Operator.Or]); // FALSE
		expect(simplifyPeerCondition([Operator.Or, [Operator.And], 1])).toEqual([Operator.And]); // TRUE
		expect(simplifyPeerCondition([Operator.And, 1, 2, [Operator.And, 3, 4]])).toEqual([Operator.And, 1, 2, 3, 4]);
		expect(simplifyPeerCondition([Operator.Or, 1, 2, [Operator.Or, 3, 4]])).toEqual([Operator.Or, 1, 2, 3, 4]);
		expect(simplifyPeerCondition([Operator.And, 1, 1, 2])).toEqual([Operator.And, 1, 2]);
		expect(simplifyPeerCondition([Operator.Or, 1, 1, 2])).toEqual([Operator.Or, 1, 2]);
		expect(simplifyPeerCondition([Operator.And, 1])).toEqual(1);
		expect(simplifyPeerCondition([Operator.Or, 1])).toEqual(1);
		expect(simplifyPeerCondition([Operator.Not, [Operator.Not, 1]])).toEqual(1);
		expect(simplifyPeerCondition([Operator.Not, [Operator.Or, 1, 2]])).toEqual([Operator.And, [Operator.Not, 1], [Operator.Not, 2]]);
		expect(simplifyPeerCondition([Operator.Not, [Operator.And, 1, 2]])).toEqual([Operator.Or, [Operator.Not, 1], [Operator.Not, 2]]);
		expect(simplifyPeerCondition([Operator.Not, [Operator.And, [Operator.Or, 1, 2], [Operator.Or, 3, 4]]])).toEqual([
			Operator.Or,
			[Operator.And, [Operator.Not, 1], [Operator.Not, 2]],
			[Operator.And, [Operator.Not, 3], [Operator.Not, 4]],
		]);
		expect(simplifyPeerCondition([Operator.Not, [Operator.Or, [Operator.And, 1, 2], [Operator.And, 3, 4]]])).toEqual([
			Operator.And,
			[Operator.Or, [Operator.Not, 1], [Operator.Not, 2]],
			[Operator.Or, [Operator.Not, 3], [Operator.Not, 4]],
		]);
		expect(simplifyPeerCondition([Operator.And, [Operator.Or, [Operator.And, 1], 2, [Operator.Or]], [Operator.Or, [Operator.And, 3], [Operator.Or], 4]])).toEqual([
			Operator.And,
			[Operator.Or, 1, 2],
			[Operator.Or, 3, 4],
		]);
		expect(simplifyPeerCondition([Operator.Or, [Operator.And, [Operator.Or, 1], 2, [Operator.And]], [Operator.And, [Operator.Or, 3], [Operator.And], 4]])).toEqual([
			Operator.Or,
			[Operator.And, 1, 2],
			[Operator.And, 3, 4],
		]);

		// no better simplification:
		expect(simplifyPeerCondition([Operator.And, [Operator.Or, 1, 2], [Operator.Or, 3, 4]])).toEqual([Operator.And, [Operator.Or, 1, 2], [Operator.Or, 3, 4]]);
		expect(simplifyPeerCondition([Operator.Or, [Operator.And, 1, 2], [Operator.And, 3, 4]])).toEqual([Operator.Or, [Operator.And, 1, 2], [Operator.And, 3, 4]]);
	});
});
