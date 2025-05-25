<script lang="ts">
	import { faCheckCircle, faInfoCircle, faWarning, faXmarkCircle, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
	import { ToastType, toasts$ } from "./toasts";
	import FaIcon from "../generic/FaIcon.svelte";
	const classes: Record<ToastType, string> = {
		[ToastType.info]: "alert-info",
		[ToastType.success]: "alert-success",
		[ToastType.warning]: "alert-warning",
		[ToastType.error]: "alert-error",
	};
	const icons: Record<ToastType, IconDefinition> = {
		[ToastType.info]: faInfoCircle,
		[ToastType.success]: faCheckCircle,
		[ToastType.warning]: faWarning,
		[ToastType.error]: faXmarkCircle,
	};
</script>

<div class="toast toast-top toast-end mt-16 z-10">
	{#each $toasts$ as toast (toast)}
		<div class="alert {classes[toast.type]}">
			<FaIcon icon={icons[toast.type]} />
			<span>{toast.message}</span>
		</div>
	{/each}
</div>
