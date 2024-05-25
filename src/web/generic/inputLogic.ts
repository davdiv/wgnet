import { type WritableSignal, asWritable, computed } from "@amadeus-it-group/tansu";

export const transformNull = (value$: WritableSignal<string | null>) =>
	asWritable(
		computed(() => {
			const res = value$();
			return res == null ? "" : res;
		}),
		(newValue) => {
			value$.set(newValue === "" ? null : newValue);
		},
	);

export const enableAutofocus = (item: HTMLInputElement | HTMLTextAreaElement, enabled: boolean) => {
	if (enabled) {
		item.select();
	}
};
