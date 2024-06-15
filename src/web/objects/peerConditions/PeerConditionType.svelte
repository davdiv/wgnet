<script lang="ts">
	import type { WritableSignal } from "@amadeus-it-group/tansu";
	import { ComposedConditionType, SimpleConditionType, type PeerCondition } from "../../../common/peerConditions/evaluate";
	import { bindType } from "./utils";

	export let value$: WritableSignal<PeerCondition>;
	const type$ = bindType(value$);
</script>

<select bind:value={$type$} class="select select-ghost select-sm m-2">
	<option value={SimpleConditionType.Tag}>TAG</option>
	<option value={SimpleConditionType.PeerId}>PEER</option>
	<option value={ComposedConditionType.And}>AND</option>
	<option value={ComposedConditionType.Or}>OR</option>
	<option value={ComposedConditionType.Not}>NOT</option>
</select>
