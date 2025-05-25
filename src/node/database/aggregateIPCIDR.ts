import { IPSet, formatIPCIDR } from "../../common/ip";

export const aggregateIPCIDR = {
	start: () => new IPSet(),
	step: (context: IPSet, ...args: (Buffer | number | null)[]) => {
		for (let i = 0, l = args.length; i < l; i += 2) {
			const [ip, netmask] = [args[i], args[i + 1]];
			if (ip) {
				if (!(ip instanceof Uint8Array) || (netmask != null && typeof netmask != "number")) {
					throw new Error(`Invalid arguments: ${ip}, ${netmask}`);
				}
				context.add(ip, netmask);
			}
		}
		return context;
	},
	result: (context: IPSet) => JSON.stringify(context.toCIDRs().map(formatIPCIDR)),
};
