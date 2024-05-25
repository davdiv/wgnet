import { asWritable, computed, derived, untrack, writable, type ReadableSignal } from "@amadeus-it-group/tansu";
import { promiseStoreToValueStore } from "../../common/promiseToStore";
import { formatConfig, isValidOutputFormat, outputFormatExtension, outputFormatMimeType } from "../../common/wgConfig/format";
import { refresh$ } from "../data";
import { getPeerConfig } from "../requests";
import { navigate } from "../router/locationStore";

export const toBlobURL = (blob$: ReadableSignal<Blob | null | undefined>) =>
	derived(
		blob$,
		(value, set) => {
			if (!value) {
				set(null);
				return;
			}
			const url = URL.createObjectURL(value);
			set(url);
			return () => {
				URL.revokeObjectURL(url);
			};
		},
		null as string | null,
	);

export const createPeerConfigLogic = () => {
	const matchParams$ = writable({ format: "", id: "" });
	const showConfig$ = writable(false);
	const id$ = computed(() => +matchParams$().id);
	const format$ = asWritable(
		computed(() => {
			const res = matchParams$().format;
			if (isValidOutputFormat(res)) {
				return res;
			}
			return null;
		}),
		(newFormat) => navigate(`/peers/${id$()}/config${newFormat ? `/${newFormat}` : ""}`),
	);
	const peerConfigPromise$ = computed(() => {
		const id = id$();
		refresh$();
		return untrack(() => getPeerConfig(id));
	});
	const config$ = promiseStoreToValueStore(peerConfigPromise$, null);
	const formattedConfigPromise$ = computed(() => {
		const format = format$();
		if (format) {
			const config = config$();
			if (config) {
				return untrack(() => formatConfig(format, config));
			}
		}
	});
	const formattedConfig$ = promiseStoreToValueStore(formattedConfigPromise$, null);
	const formattedConfigBlob$ = computed(() => {
		const format = format$();
		if (format) {
			const formattedConfig = formattedConfig$();
			if (formattedConfig) {
				return new Blob([formattedConfig], { type: outputFormatMimeType[format] ?? "text/plain" });
			}
		}
	});
	const configURL$ = toBlobURL(formattedConfigBlob$);
	const configFileName$ = computed(() => {
		const format = format$();
		if (format) {
			const config = config$();
			return `${config?.interfaceName ?? "wg0"}${outputFormatExtension[format]}`;
		}
	});
	return { matchParams$, format$, formattedConfig$, configURL$, configFileName$, showConfig$ };
};
