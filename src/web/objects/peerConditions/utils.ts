import { asWritable, computed, untrack, type WritableSignal } from "@amadeus-it-group/tansu";
import { ComposedConditionType, SimpleConditionType, isPeerIdCondition, isSimpleCondition, isTagCondition, type PeerCondition } from "../../../common/peerConditions/evaluate";

export const bindType = (value$: WritableSignal<PeerCondition>) => {
	const type$ = computed(() => value$()?.[0] ?? SimpleConditionType.Tag);
	return asWritable(type$, (newType: ComposedConditionType | SimpleConditionType) => {
		const existingType = untrack(type$);
		if (existingType != newType) {
			const existingValue = untrack(value$);
			const reusableItems = isSimpleCondition(existingValue) ? [existingValue] : (existingValue.slice(1) as PeerCondition[]);
			if (newType === SimpleConditionType.Tag) {
				value$.set(reusableItems.length >= 1 && isTagCondition(reusableItems[0]) ? reusableItems[0] : [SimpleConditionType.Tag, -1]);
			} else if (newType === SimpleConditionType.PeerId) {
				value$.set(reusableItems.length >= 1 && isPeerIdCondition(reusableItems[0]) ? reusableItems[0] : [SimpleConditionType.PeerId, -1]);
			} else if (newType === ComposedConditionType.Not) {
				value$.set([ComposedConditionType.Not, reusableItems[0] ?? [SimpleConditionType.Tag, -1]]);
			} else if (newType === ComposedConditionType.And || newType === ComposedConditionType.Or) {
				value$.set([newType, ...reusableItems]);
			}
		}
	});
};

export const itemWritable = <T extends any[]>(parentWritable: WritableSignal<T>, index: number) =>
	asWritable(
		computed(() => parentWritable()?.[index]),
		(value) => {
			parentWritable.update((parentValue) => {
				parentValue[index] = value;
				return parentValue;
			});
		},
	);
