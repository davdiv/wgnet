<script lang="ts">
	import { type DataSet, Network } from "vis-network";

	let network: Network;

	export let nodes: DataSet<{ id: number; label: string }>;
	export let edges: DataSet<{ from: number; to: number; id: string }>;
	export let selectedNodes: number[] = [];
	export let selectedEdges: string[] = [];
	export let onDoubleClick: null | ((event: any) => void) = null;

	const setSelection = (...args: any) =>
		network?.setSelection(
			{ nodes: [...selectedNodes], edges: [...selectedEdges] },
			{
				unselectAll: true,
				highlightEdges: false,
			},
		);

	$: {
		network?.setData({ nodes, edges });
		setSelection();
	}
	$: setSelection(selectedNodes, selectedEdges);

	const checkUserChangedSelection = () => {
		const { edges, nodes } = network.getSelection();
		selectedNodes = [...nodes] as any;
		selectedEdges = [...edges] as any;
	};

	const vis = (div: HTMLDivElement) => {
		network = new Network(
			div,
			{ nodes, edges },
			{
				interaction: {
					keyboard: {
						bindToWindow: false,
					},
					selectConnectedEdges: false,
					multiselect: true,
				},
			},
		);
		setSelection();
		network.on("doubleClick", (arg) => onDoubleClick?.(arg));
		network.on("select", checkUserChangedSelection);
		network.on("dragStart", checkUserChangedSelection);
		return {
			destroy: () => network.destroy(),
		};
	};
</script>

<div {...$$restProps} use:vis></div>
