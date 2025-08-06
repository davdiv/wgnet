import { formatIP, parseIPCIDR } from "../../common/ip";
import type { FieldDefinition } from "./formLogic.svelte";

export const cidrField: FieldDefinition<{ ip: string; netmask: number }, string> = {
	getter: (formValue) => (formValue.netmask >= 0 ? `${formValue.ip}/${formValue.netmask}` : formValue.ip),
	setter: (formValue, fieldValue) => {
		const cidr = parseIPCIDR(fieldValue);
		formValue.ip = formatIP(cidr[0]);
		formValue.netmask = cidr[1];
	},
};
