import { describe, expect, test } from "vitest";
import { matchPeerCondition } from "../src/common/peerConditions/evaluate";
import { simplifyPeerCondition } from "../src/common/peerConditions/simplify";
import { validatePeerCondition } from "../src/common/peerConditions/validate";
import { pcAnd, pcNot, pcOr, pcPeerId, pcTag } from "./peerConditionUtils";

describe("validatePeerCondition", () => {
	test("should work", () => {
		expect(validatePeerCondition(null)).toBe(true);
		expect(validatePeerCondition('["t",0]')).toBe(false);
		expect(validatePeerCondition('["t",-5]')).toBe(false);
		expect(validatePeerCondition('["t",1]')).toBe(true);
		expect(validatePeerCondition('["t",5]')).toBe(true);
		expect(validatePeerCondition("[0]")).toBe(false);
		expect(validatePeerCondition("[10]")).toBe(false);

		// AND
		expect(validatePeerCondition('["a"]')).toBe(true); // empty AND
		expect(validatePeerCondition('["a",["t",2]]')).toBe(true);
		expect(validatePeerCondition('["a",["t",2],["t",4]]')).toBe(true);
		expect(validatePeerCondition('["a",["t",2],["t",4],["t",7]]')).toBe(true);
		expect(validatePeerCondition('["a",["t",2],["o",["t",4],["t",9]],["t",7]]')).toBe(true);

		// OR
		expect(validatePeerCondition('["o"]')).toBe(true); // empty OR
		expect(validatePeerCondition('["o",["t",1]]')).toBe(true);
		expect(validatePeerCondition('["o",["t",1],["t",4]]')).toBe(true);
		expect(validatePeerCondition('["o",["t",1],["t",4],["a",["t",7],["t",2]]]')).toBe(true);

		// NOT:
		expect(validatePeerCondition('["n"]')).toBe(false); // empty NOT
		expect(validatePeerCondition('["n",["t",1]]')).toBe(true);
		expect(validatePeerCondition('["n",["t",5]]')).toBe(true);
		expect(validatePeerCondition('["n",["o",["t",5],["t",6]]]')).toBe(true);
		expect(validatePeerCondition('["n",["t",-1]]')).toBe(false);
		expect(validatePeerCondition('["n",["t",1],["t",4]]')).toBe(false);

		expect(validatePeerCondition("")).toBe(false);
		expect(validatePeerCondition("[")).toBe(false);
		expect(validatePeerCondition('{"0":"a"}')).toBe(false);
		expect(validatePeerCondition('{"0":"a","length":1}')).toBe(false);
	});
});

describe("matchPeerCondition", () => {
	test("should work", () => {
		expect(matchPeerCondition(null, "[]", 1)).toBe(1);
		expect(matchPeerCondition(null, "[1]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcTag(1)), "[1]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcTag(1)), "[]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcAnd()), "[]", 1)).toBe(1); // empty AND = TRUE
		expect(matchPeerCondition(JSON.stringify(pcOr()), "[]", 1)).toBe(0); // empty OR = FALSE
		expect(matchPeerCondition(JSON.stringify(pcPeerId(6)), "[]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcPeerId(6))), "[]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcPeerId(6)), "[]", 6)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcPeerId(6))), "[]", 6)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcAnd(pcTag(5), pcTag(6))), "[]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcAnd(pcTag(5), pcTag(6)))), "[]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcAnd(pcTag(5), pcTag(6))), "[5]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcAnd(pcTag(5), pcTag(6)))), "[5]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcAnd(pcTag(5), pcTag(6))), "[6]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcAnd(pcTag(5), pcTag(6)))), "[6]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcAnd(pcTag(5), pcTag(6))), "[5,6]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcAnd(pcTag(5), pcTag(6)))), "[5,6]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcAnd(pcTag(5), pcTag(6))), "[1,5,6]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcOr(pcTag(5), pcTag(6))), "[]", 1)).toBe(0);
		expect(matchPeerCondition(JSON.stringify(pcOr(pcTag(5), pcTag(6))), "[5]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcOr(pcTag(5), pcTag(6))), "[6]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcOr(pcTag(5), pcTag(6))), "[5,6]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcTag(6))), "[]", 1)).toBe(1);
		expect(matchPeerCondition(JSON.stringify(pcNot(pcTag(6))), "[6]", 1)).toBe(0);
	});
});

describe("simplify", () => {
	test("should work", () => {
		expect(simplifyPeerCondition(pcAnd())).toEqual(pcAnd()); // TRUE
		expect(simplifyPeerCondition(pcOr())).toEqual(pcOr()); // FALSE
		expect(simplifyPeerCondition(pcAnd(pcTag(1), pcNot(pcTag(1))))).toEqual(pcOr()); // FALSE
		expect(simplifyPeerCondition(pcOr(pcTag(1), pcNot(pcTag(1))))).toEqual(pcAnd()); // TRUE
		expect(simplifyPeerCondition(pcAnd(pcNot(pcTag(1)), pcTag(1)))).toEqual(pcOr()); // FALSE
		expect(simplifyPeerCondition(pcOr(pcNot(pcTag(1)), pcTag(1)))).toEqual(pcAnd()); // TRUE
		expect(simplifyPeerCondition(pcAnd(pcOr(), pcTag(1)))).toEqual(pcOr()); // FALSE
		expect(simplifyPeerCondition(pcOr(pcAnd(), pcTag(1)))).toEqual(pcAnd()); // TRUE
		expect(simplifyPeerCondition(pcAnd(pcTag(1), pcTag(2), pcAnd(pcTag(3), pcTag(4))))).toEqual(pcAnd(pcTag(1), pcTag(2), pcTag(3), pcTag(4)));
		expect(simplifyPeerCondition(pcOr(pcTag(1), pcTag(2), pcOr(pcTag(3), pcTag(4))))).toEqual(pcOr(pcTag(1), pcTag(2), pcTag(3), pcTag(4)));
		expect(simplifyPeerCondition(pcAnd(pcTag(1), pcTag(1), pcTag(2)))).toEqual(pcAnd(pcTag(1), pcTag(2)));
		expect(simplifyPeerCondition(pcOr(pcTag(1), pcTag(1), pcTag(2)))).toEqual(pcOr(pcTag(1), pcTag(2)));
		expect(simplifyPeerCondition(pcAnd(pcPeerId(1), pcPeerId(2)))).toEqual(pcOr());
		expect(simplifyPeerCondition(pcAnd(pcPeerId(1), pcPeerId(1)))).toEqual(pcPeerId(1));
		expect(simplifyPeerCondition(pcAnd(pcTag(1), pcTag(1)))).toEqual(pcTag(1));
		expect(simplifyPeerCondition(pcOr(pcTag(1), pcTag(1)))).toEqual(pcTag(1));
		expect(simplifyPeerCondition(pcAnd(pcTag(1)))).toEqual(pcTag(1));
		expect(simplifyPeerCondition(pcOr(pcTag(1)))).toEqual(pcTag(1));
		expect(simplifyPeerCondition(pcNot(pcNot(pcTag(1))))).toEqual(pcTag(1));
		expect(simplifyPeerCondition(pcNot(pcOr(pcTag(1), pcTag(2))))).toEqual(pcAnd(pcNot(pcTag(1)), pcNot(pcTag(2))));
		expect(simplifyPeerCondition(pcNot(pcAnd(pcTag(1), pcTag(2))))).toEqual(pcOr(pcNot(pcTag(1)), pcNot(pcTag(2))));
		expect(simplifyPeerCondition(pcNot(pcAnd(pcOr(pcTag(1), pcTag(2)), pcOr(pcTag(3), pcTag(4)))))).toEqual(pcOr(pcAnd(pcNot(pcTag(1)), pcNot(pcTag(2))), pcAnd(pcNot(pcTag(3)), pcNot(pcTag(4)))));
		expect(simplifyPeerCondition(pcNot(pcOr(pcAnd(pcTag(1), pcTag(2)), pcAnd(pcTag(3), pcTag(4)))))).toEqual(pcAnd(pcOr(pcNot(pcTag(1)), pcNot(pcTag(2))), pcOr(pcNot(pcTag(3)), pcNot(pcTag(4)))));
		expect(simplifyPeerCondition(pcAnd(pcOr(pcAnd(pcTag(1)), pcTag(2), pcOr()), pcOr(pcAnd(pcTag(3)), pcOr(), pcTag(4))))).toEqual(pcAnd(pcOr(pcTag(1), pcTag(2)), pcOr(pcTag(3), pcTag(4))));
		expect(simplifyPeerCondition(pcOr(pcAnd(pcOr(pcTag(1)), pcTag(2), pcAnd()), pcAnd(pcOr(pcTag(3)), pcAnd(), pcTag(4))))).toEqual(pcOr(pcAnd(pcTag(1), pcTag(2)), pcAnd(pcTag(3), pcTag(4))));

		// no better simplification:
		expect(simplifyPeerCondition(pcAnd(pcOr(pcTag(1), pcTag(2)), pcOr(pcTag(3), pcTag(4))))).toEqual(pcAnd(pcOr(pcTag(1), pcTag(2)), pcOr(pcTag(3), pcTag(4))));
		expect(simplifyPeerCondition(pcOr(pcAnd(pcTag(1), pcTag(2)), pcAnd(pcTag(3), pcTag(4))))).toEqual(pcOr(pcAnd(pcTag(1), pcTag(2)), pcAnd(pcTag(3), pcTag(4))));
	});
});
