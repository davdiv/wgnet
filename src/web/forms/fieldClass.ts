import type { Form } from "./formLogic.svelte";

export const fieldClass = <T, F extends object>(form: Form<T, F>, field: keyof F) => ({
	"input-ghost": !form.fieldsChanged[field],
	"input-error": !!form.errors?.[field],
});
