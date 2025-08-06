import { createNavManager, type NavManagerKeyHandler } from "@agnos-ui/core/services/navManager";
import { bindDirective } from "@agnos-ui/core/utils/directive";
import { readable } from "@amadeus-it-group/tansu";

const noop = () => {};
export const createListNavigation = (querySelector = "a", escapeHandler: NavManagerKeyHandler = noop) => {
	const { directive, focusFirst, focusLast, focusNext, focusPrevious } = createNavManager();

	return bindDirective(
		directive,
		readable({
			selector: (item) => [item, ...(item.querySelectorAll(querySelector) as any as HTMLElement[])],
			keys: {
				Escape: escapeHandler,
				Home: focusFirst,
				End: focusLast,
				ArrowUp: focusPrevious,
				ArrowDown: focusNext,
			},
		}),
	);
};
