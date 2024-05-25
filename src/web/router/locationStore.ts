import { computed, readable } from "@amadeus-it-group/tansu";

const noop = () => {};
let updateURL = noop;

export const url$ = readable(location.href, (set) => {
	const _updateURL = () => {
		set(location.href);
	};
	updateURL = _updateURL;
	window.addEventListener("popstate", _updateURL);
	return () => {
		window.removeEventListener("popstate", _updateURL);
		updateURL = noop;
	};
});

const urlObject$ = computed(() => new URL(url$()));
export const pathname$ = computed(() => urlObject$().pathname);
export const search$ = computed(() => urlObject$().search);
export const searchParams$ = computed(() => new URLSearchParams(search$()));
export const hash$ = computed(() => urlObject$().hash);
export const hashParams$ = computed(() => new URLSearchParams(hash$()));

export const navigate = (url: string, replace = false) => {
	if (replace) {
		history.replaceState(null, "", url);
	} else {
		history.pushState(null, "", url);
	}
	updateURL();
};
