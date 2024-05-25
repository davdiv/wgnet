// partly copied from https://github.com/AmadeusITGroup/AgnosUI/blob/153deeca4ea6023f78fa56c4afcdb7fd5fb26ad6/core/src/utils/internal/promise.ts
// (and modified)

import type { ReadableSignal } from "@amadeus-it-group/tansu";
import { asReadable, computed, derived, equal, readable, writable } from "@amadeus-it-group/tansu";

export interface PromisePendingResult {
	/** Pending status */
	status: "pending";
}
export const promisePending: PromisePendingResult = { status: "pending" };

export type PromiseState<T> = PromiseFulfilledResult<T> | PromiseRejectedResult | PromisePendingResult;

const isThenable = (value: any): value is PromiseLike<any> => {
	// cf https://tc39.es/ecma262/#sec-promise-resolve-functions
	const type = typeof value;
	return (type === "object" && value !== null) || type === "function" ? typeof value.then === "function" : false;
};

const createPromiseStateStore = <T>(promise: PromiseLike<T>): ReadableSignal<PromiseState<T>> => {
	const store = writable(promisePending as PromiseState<T>);
	Promise.resolve(promise).then(
		(value) => store.set({ status: "fulfilled", value }),
		(reason) => store.set({ status: "rejected", reason }),
	);
	return asReadable(store);
};

const promiseWeakMap = new WeakMap<PromiseLike<any>, ReadableSignal<PromiseState<any>>>();

/**
 * Create a readable promise state store from a promise.
 *
 * The state of the returned store tracks the state of the promise and the resolved value or rejection reason.
 *
 * @param value - the promise
 * @returns the readable promise state store
 */
export const promiseStateStore = <T>(value: T): ReadableSignal<Readonly<PromiseState<Awaited<T>>>> => {
	if (!isThenable(value)) {
		return readable({ status: "fulfilled", value: value as Awaited<T> });
	}
	let response = promiseWeakMap.get(value);
	if (!response) {
		response = createPromiseStateStore(value);
		promiseWeakMap.set(value, response);
	}
	return response;
};

const promiseStateStoreEqual = <T>(a: PromiseState<T>, b: PromiseState<T>) =>
	Object.is(a, b) ||
	(a.status === b.status && (a.status !== "fulfilled" || equal(a.value, (b as PromiseFulfilledResult<T>).value)) && (a.status !== "rejected" || equal(a.reason, (b as PromiseRejectedResult).reason)));

/**
 * Create a readable promise state store from a promise store.
 *
 * @param promiseStore$ - the promise store
 * @returns the readable promise state store
 */
export const promiseStoreToPromiseStateStore = <T>(promiseStore$: ReadableSignal<T>): ReadableSignal<PromiseState<Awaited<T>>> =>
	computed(() => promiseStateStore(promiseStore$())(), { equal: promiseStateStoreEqual });

/**
 * Create a value store from a promise state store
 *
 * The returned value store is only updated if the promise is fulfilled.
 *
 * @param store$ - the promise state store
 * @param initialValue - the initial value of the returned value store
 * @param equal - an equal function to compare values
 * @returns the value store
 */
export const promiseStateStoreToValueStore = <T>(store$: ReadableSignal<PromiseState<T>>, initialValue: T, equal?: (a: T, b: T) => boolean): ReadableSignal<T> =>
	derived(
		store$,
		{
			derive: (state, set) => {
				if (state.status === "fulfilled") {
					set(state.value);
				}
			},
			equal,
		},
		initialValue,
	);

/**
 * Create a value store from a promise store
 *
 * The returned value store is only updated if the promise is fulfilled.
 *
 * @param promiseStore$ - the promise store
 * @param initialValue - the initial value of the returned value store
 * @param equal - an equal function to compare values
 * @returns the value store
 */
export const promiseStoreToValueStore = <T>(promiseStore$: ReadableSignal<T>, initialValue: Awaited<T>, equal?: (a: Awaited<T>, b: Awaited<T>) => boolean): ReadableSignal<Awaited<T>> =>
	promiseStateStoreToValueStore(promiseStoreToPromiseStateStore(promiseStore$), initialValue, equal);
