<script lang="ts">
	import Route from "./Route.svelte";
	import Lazy from "./Lazy.svelte";
	export let component: any;
	export let args: any = {};
	export let prefix = false;
	export let path: string;
</script>

<Route {path} {prefix} let:match>
	<Lazy {component} args={{ ...args, match }} />
</Route>
