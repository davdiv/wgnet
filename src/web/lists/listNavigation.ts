import { createNavManager } from "@agnos-ui/core/services/navManager";
import { bindDirective } from "@agnos-ui/core/utils/directive";
import { readable } from "@amadeus-it-group/tansu";

export const createListNavigation = (querySelector = "a") => {
	const { directive, focusFirst, focusLast, focusNext, focusPrevious } = createNavManager();

	return bindDirective(
		directive,
		readable({
			selector: (item) => item.querySelectorAll(querySelector),
			keys: {
				Home: focusFirst,
				End: focusLast,
				ArrowUp: focusPrevious,
				ArrowDown: focusNext,
			},
		}),
	);
};
