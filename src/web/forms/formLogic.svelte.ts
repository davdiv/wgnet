import { SvelteMap } from "svelte/reactivity";
import { formsData } from "./formData.svelte";
export type BooleansRecord<F extends object> = { readonly [K in keyof F]: boolean };

export interface Form<T, F extends object> {
	fields: F;
	fieldsChanged: BooleansRecord<F>;
	submit(): Promise<void>;
	reset(): void;
	originalValue: T;
	modifiedValue: T;
}

export interface FieldDefinition<T, F> {
	getter: (formValue: T, fieldName: symbol | string | number) => F;
	setter: (formValue: T, fieldValue: F, fieldName: symbol | string | number) => void;
}

export const simpleField: FieldDefinition<any, string> = {
	getter: (formValue, fieldName) => formValue[fieldName],
	setter: (formValue, fieldValue, fieldName) => {
		formValue[fieldName] = fieldValue;
	},
};

export interface FormParameters<T, F extends object> {
	formHref: string;
	originalValue: T;
	submit: (value: T) => Promise<void>;
	readonly?: boolean;
	fields: { [K in keyof F]: FieldDefinition<T, F[K]> };
}

export const createForm = <T, F extends object>(param: FormParameters<T, F>): Form<T, F> => {
	const fields = {} as F;
	const fieldsChanged = {} as BooleansRecord<F>;
	const storage = $derived.by(() => formsData.get(param.formHref));
	for (const [fieldName, definition] of Object.entries(param.fields) as [string, FieldDefinition<T, any>][]) {
		const changedValue = $derived(storage?.has(fieldName));
		const fieldValue = $derived(changedValue ? storage!.get(fieldName) : definition.getter(param.originalValue, fieldName));
		Object.defineProperty(fields, fieldName, {
			get() {
				return fieldValue;
			},
			set(value) {
				if (param.readonly || value === fieldValue) {
					return false;
				}
				if (!storage) {
					formsData.set(param.formHref, new SvelteMap());
				}
				storage?.set(fieldName, value);
				return true;
			},
		});
		Object.defineProperty(fieldsChanged, fieldName, {
			get: () => changedValue,
		});
	}
	const modifiedValue = $derived.by(() => {
		if (storage) {
			const copy = { ...param.originalValue };
			for (const [fieldName, fieldValue] of storage.entries() as MapIterator<[keyof F, any]>) {
				param.fields[fieldName].setter(copy, fieldValue, fieldName);
			}
			return copy;
		} else {
			return param.originalValue;
		}
	});
	const reset = () => {
		formsData.delete(param.formHref);
	};
	return {
		fields,
		fieldsChanged,
		get modifiedValue() {
			return modifiedValue;
		},
		get originalValue() {
			return param.originalValue;
		},
		async submit() {
			await param.submit(modifiedValue);
			reset();
		},
		reset,
	};
};
