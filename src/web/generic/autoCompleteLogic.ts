import { createHasFocus } from "@agnos-ui/core/services/focustrack";
import { createNavManager } from "@agnos-ui/core/services/navManager";
import { bindDirective, createBrowserStoreDirective } from "@agnos-ui/core/utils/directive";
import { computed, readable, untrack, writable } from "@amadeus-it-group/tansu";

export const createAutoCompleteLogic = <T>() => {
	const getSuggestions$ = writable((text: string): T[] => []);
	const text$ = writable("");
	const forceClose$ = writable(false);
	const trimmedText$ = computed(() => {
		untrack(() => forceClose$.set(false));
		return text$().trim();
	});
	const suggestions$ = computed(() => getSuggestions$()(trimmedText$()));
	const { directive: hasFocusDirective, hasFocus$: hasFocusRaw$ } = createHasFocus();
	const { directive: inputDirective, element$: inputElement$ } = createBrowserStoreDirective();
	const hasFocus$ = computed(() => {
		untrack(() => forceClose$.set(false));
		return hasFocusRaw$();
	});
	const closeSuggestions = () => {
		inputElement$()?.focus();
		forceClose$.set(true);
	};

	const navManager = createNavManager();
	const navManagerDirective = bindDirective(
		navManager.directive,
		readable({
			selector: (item) => [item, ...(item.querySelectorAll("a,button") as any as HTMLElement[])],
			keys: {
				Escape: closeSuggestions,
				Home: navManager.focusFirst,
				End: navManager.focusLast,
				ArrowUp: navManager.focusPrevious,
				ArrowDown: navManager.focusNext,
			},
		}),
	);

	const showSuggestions$ = computed(() => hasFocus$() && !forceClose$() && !!trimmedText$());

	return { closeSuggestions, showSuggestions$, getSuggestions$, suggestions$, inputDirective, hasFocusDirective, navManagerDirective, text$ };
};
