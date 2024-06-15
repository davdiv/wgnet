import type { PeerCondition } from "./evaluate";
import { ComposedConditionType, SimpleConditionType } from "./evaluate";

const createValidateParsedPeerCondition = (acceptMinusOne: boolean) => {
	const validate = (x: any): x is PeerCondition => {
		if (!Array.isArray(x)) {
			return false;
		}
		switch (x[0]) {
			case SimpleConditionType.PeerId:
			case SimpleConditionType.Tag:
				return x.length === 2 && ((x[1] > 0 && Number.isSafeInteger(x[1])) || (acceptMinusOne && x[1] === -1));
			case ComposedConditionType.Not:
				return x.length === 2 && validate(x[1]);
			case ComposedConditionType.And:
			case ComposedConditionType.Or:
				return x.slice(1).every(validate);
			default:
				return false;
		}
	};
	return validate;
};
export const validateParsedPeerCondition = createValidateParsedPeerCondition(false);
export const validateEditedParsedPeerCondition = createValidateParsedPeerCondition(true);

export const validatePeerCondition = (strValue: string | null) => {
	if (strValue == null) {
		return true;
	}
	try {
		const value = JSON.parse(strValue);
		return validateParsedPeerCondition(value);
	} catch {
		return false;
	}
};
