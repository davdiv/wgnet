import { computed, writable } from "@amadeus-it-group/tansu";
import { createListNavigation } from "../lists/listNavigation";
import { createPopupLogic } from "./popupLogic";

export const createAutoCompleteLogic = <T>() => {
	const { closePopup: closeSuggestions, showPopup$, openerDirective: inputDirective, hasFocusDirective, stopForceClose } = createPopupLogic();
	const getSuggestions$ = writable((text: string): T[] => []);
	const text$ = writable("");
	const trimmedText$ = computed(() => {
		stopForceClose();
		return text$().trim();
	});
	const suggestions$ = computed(() => getSuggestions$()(trimmedText$()));

	const navManagerDirective = createListNavigation("a,button", closeSuggestions);

	const showSuggestions$ = computed(() => showPopup$() && !!trimmedText$());

	return { closeSuggestions, showSuggestions$, getSuggestions$, suggestions$, inputDirective, hasFocusDirective, navManagerDirective, text$ };
};
