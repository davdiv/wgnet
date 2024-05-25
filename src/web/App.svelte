<script lang="ts">
	import { faHome, faRefresh, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
	import { refresh } from "./data";
	import FaIcon from "./generic/FaIcon.svelte";
	import NavBar from "./generic/NavBar.svelte";
	import LazyRoute from "./router/LazyRoute.svelte";
	import Link from "./router/Link.svelte";
	import { pathname$ } from "./router/locationStore";
	import SearchField from "./search/SearchField.svelte";
	import SearchResults from "./search/SearchResults.svelte";
	import Toasts from "./toasts/Toasts.svelte";
</script>

<NavBar>
	{#if $pathname$ !== "/"}
		<div class="flex-none">
			<Link class="btn btn-ghost text-xl" href="/" title="Home page"><FaIcon class="sm:hidden" icon={faHome} /><span class="hidden sm:block">wgnet</span></Link>
		</div>
	{/if}
	<SearchField />
	<div class="flex-none">
		<button type="button" class="btn btn-ghost text-xl" on:click={refresh} title="Refresh"><FaIcon icon={faRefresh}></FaIcon></button>
		<a class="btn btn-ghost text-xl" href="/logout" title="Logout"><FaIcon icon={faRightFromBracket}></FaIcon></a>
	</div>
</NavBar>
<SearchResults />
<Toasts />
<div class="flex flex-col min-h-dvh w-full absolute top-0">
	<div class="h-16"></div>
	<div class="flex-1 relative">
		<LazyRoute path="/network" component={() => import("./routes/Network.svelte")} />
		<LazyRoute path="/peers" component={() => import("./routes/AllPeers.svelte")} />
		<LazyRoute path="/peers/:id" component={() => import("./routes/PeerInfo.svelte")} />
		<LazyRoute path="/peers/:id/config/:format?" component={() => import("./routes/PeerConfig.svelte")} />
		<LazyRoute path="/tags" component={() => import("./routes/AllTags.svelte")} />
		<LazyRoute path="/tags/:id" component={() => import("./routes/TagInfo.svelte")} />
		<LazyRoute path="/searchByTag/:query?" component={() => import("./routes/SearchByTag.svelte")} />
		<LazyRoute path="/" component={() => import("./routes/Home.svelte")} />
	</div>
</div>
