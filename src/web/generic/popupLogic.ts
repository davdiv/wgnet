import { createHasFocus } from "@agnos-ui/core/services/focustrack";
import { createBrowserStoreDirective } from "@agnos-ui/core/utils/directive";
import { computed, untrack, writable } from "@amadeus-it-group/tansu";

export const createPopupLogic = () => {
	const forceClose$ = writable(false);
	const { directive: hasFocusDirective, hasFocus$: hasFocusRaw$ } = createHasFocus();
	const { directive: openerDirective, element$: openerElement$ } = createBrowserStoreDirective();
	const stopForceClose = () => untrack(() => forceClose$.set(false));
	const hasFocus$ = computed(() => {
		stopForceClose();
		return hasFocusRaw$();
	});
	const closePopup = () => {
		openerElement$()?.focus();
		forceClose$.set(true);
	};
	const showPopup$ = computed(() => hasFocus$() && !forceClose$());

	return { openerDirective, showPopup$, closePopup, stopForceClose, hasFocusDirective };
};
