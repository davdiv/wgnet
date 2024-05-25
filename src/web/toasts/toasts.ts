import { writable } from "@amadeus-it-group/tansu";

export const enum ToastType {
	info,
	success,
	warning,
	error,
}

export interface Toast {
	type: ToastType;
	message: string;
}

export const toasts$ = writable([] as Toast[], { equal: Object.is });

const displayDuration = 5000;
export const addToast = (message: string, type: ToastType) => {
	const toast = { message, type };
	toasts$.update((toasts) => [...toasts, toast]);
	setTimeout(() => {
		toasts$.update((toasts) => {
			const index = toasts.indexOf(toast);
			if (index > -1) {
				toasts = [...toasts];
				toasts.splice(index, 1);
			}
			return toasts;
		});
	}, displayDuration);
};
