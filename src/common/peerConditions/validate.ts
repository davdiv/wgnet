import type { PeerCondition } from "./evaluate";
import { Operator } from "./evaluate";

const createValidateParsedPeerCondition = (acceptMinusOne: boolean) => {
	const validate = (x: any): x is PeerCondition => {
		if (Array.isArray(x)) {
			switch (x[0]) {
				case Operator.Not:
					if (x.length != 2) {
						return false;
					}
					return validate(x[1]);
				case Operator.And:
				case Operator.Or:
					return x.every(validate);
				default:
					return false;
			}
		} else if ((x > 0 && Number.isSafeInteger(x)) || (acceptMinusOne && x === -1)) {
			return true;
		}
		return false;
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
