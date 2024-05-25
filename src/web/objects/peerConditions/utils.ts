import { asWritable, computed, untrack, type WritableSignal } from "@amadeus-it-group/tansu";
import { Operator, type PeerCondition } from "../../../common/peerConditions/evaluate";

export const bindType = (value$: WritableSignal<PeerCondition>) => {
	const type$ = computed(() => {
		const value = value$();
		if (typeof value === "number") {
			return null;
		}
		return value[0];
	});
	return asWritable(type$, (newType: Operator | null) => {
		const existingType = untrack(type$);
		if (existingType != newType) {
			const existingValue = untrack(value$);
			const reusableItems = typeof existingValue === "number" ? [existingValue] : existingValue.slice(1);
			if (newType === null) {
				value$.set(reusableItems[0] ?? -1);
			} else if (newType === Operator.Not) {
				value$.set([Operator.Not, reusableItems[0] ?? -1]);
			} else if (newType === Operator.And || newType === Operator.Or) {
				value$.set([newType, ...reusableItems]);
			}
		}
	});
};
