import { fromByteArray, parse, parseCIDR } from "ipaddr.js";
import { createComparatorWithRange } from "./comparisons";
import { RangeSet } from "./rangeSet";

export type IPAddress = Uint8Array | Buffer;
export type IPRange = [IPAddress, IPAddress];
export type IPCIDR = [IPAddress, number];

export type BinaryOrStringIPAddress = IPAddress | string;
export type BinaryOrStringIPCIDR = IPCIDR | string;

export const parseIP = (ip: BinaryOrStringIPAddress): IPAddress => (typeof ip === "string" ? Uint8Array.from(parse(ip).toByteArray()) : ip);
export const parseIPCIDR = (ipcidr: BinaryOrStringIPCIDR): IPCIDR => {
	if (typeof ipcidr === "string") {
		const [ip, netmask] = parseCIDR(ipcidr);
		return [Uint8Array.from(ip.toByteArray()), netmask];
	}
	return ipcidr;
};
export const formatIP = (ip: BinaryOrStringIPAddress) => (typeof ip === "string" ? ip : fromByteArray([...ip]).toString());
export const formatIPCIDR = (ipcidr: BinaryOrStringIPCIDR) => (typeof ipcidr === "string" ? ipcidr : `${formatIP(ipcidr[0])}/${ipcidr[1]}`);

export const compareIPs = (ip1: IPAddress, ip2: IPAddress) => {
	const ip1Length = ip1.length;
	const diffLength = ip1Length - ip2.length;
	if (diffLength !== 0) {
		return diffLength;
	}
	for (let i = 0; i < ip1Length; i++) {
		const diff = ip1[i] - ip2[i];
		if (diff !== 0) {
			return diff;
		}
	}
	return 0;
};

export const nextIP = (ip: IPAddress, increment = 1) => {
	const next = Uint8Array.from(ip);
	for (let i = next.length - 1; i >= 0; i--) {
		const value = next[i];
		const nextValue = value + increment;
		if (nextValue < 0 || nextValue > 255) {
			increment = nextValue >> 8;
			next[i] = nextValue - (increment << 8);
		} else {
			next[i] = nextValue;
			return next;
		}
	}
	throw new Error("Overflowing IP");
};

export const compareIPWithRange = createComparatorWithRange(compareIPs);

export const CIDRToRange = (ip: IPAddress, netmask: number): IPRange => {
	const begin = Uint8Array.from(ip);
	const end = Uint8Array.from(ip);
	const byteNumber = Math.floor(netmask / 8);
	const bitNumber = netmask % 8;
	for (let i = ip.length - 1; i > byteNumber; i--) {
		begin[i] = 0;
		end[i] = 0xff;
	}
	begin[byteNumber] &= 0xff << (8 - bitNumber);
	end[byteNumber] |= 0xff >>> bitNumber;
	return [begin, end];
};

const findStartCIDR = (start: IPAddress, end: IPAddress): [IPCIDR, IPAddress, boolean] => {
	const comparison = compareIPs(start, end);
	let netmask = start.length * 8;
	if (comparison === 0) {
		return [[start, netmask], start, true];
	} else if (comparison > 0) {
		throw new Error("Assert failed: start > end");
	}
	const value = Uint8Array.from(start);
	for (let byteNumber = value.length - 1; byteNumber >= 0; byteNumber--) {
		let byteValue = value[byteNumber];
		for (let bitNumber = 0; bitNumber < 8; bitNumber++) {
			const bitValue = byteValue & (1 << bitNumber);
			if (bitValue) {
				return [[start, netmask], value, false];
			} else {
				byteValue = byteValue | (1 << bitNumber);
				value[byteNumber] = byteValue;
				const newComparison = compareIPs(value, end);
				if (newComparison <= 0) {
					netmask--;
				} else {
					// we went too far!
					// revert:
					byteValue = byteValue & ~(1 << bitNumber);
					value[byteNumber] = byteValue;
				}
				if (newComparison >= 0) {
					return [[start, netmask], value, newComparison === 0];
				}
			}
		}
	}
	throw new Error("Assert failed: could not find CIDR");
};

export const rangeToCIDR = (start: IPAddress, end: IPAddress): IPCIDR[] => {
	const res: IPCIDR[] = [];
	let [cidr, current, finished] = findStartCIDR(start, end);
	while (!finished) {
		res.push(cidr);
		[cidr, current, finished] = findStartCIDR(nextIP(current), end);
	}
	res.push(cidr);
	return res;
};

export const toRange = (start: IPAddress, netmaskOrEnd?: number | IPAddress | null): IPRange => {
	if (netmaskOrEnd == null || netmaskOrEnd === start.length) {
		return [start, start];
	}
	if (typeof netmaskOrEnd === "number") {
		return CIDRToRange(start, netmaskOrEnd);
	}
	return [start, netmaskOrEnd];
};

export class IPSet extends RangeSet<IPAddress> {
	constructor() {
		super(nextIP, compareIPs, compareIPWithRange);
	}

	add(start: IPAddress, netmaskOrEnd?: number | IPAddress | null): boolean {
		return super.add(...toRange(start, netmaskOrEnd));
	}

	remove(start: IPAddress, netmaskOrEnd?: number | IPAddress | null): boolean {
		return super.remove(...toRange(start, netmaskOrEnd));
	}

	containsAll(start: IPAddress, netmaskOrEnd?: number | IPAddress | null) {
		return super.containsAll(...toRange(start, netmaskOrEnd));
	}

	containsSome(start: IPAddress, netmaskOrEnd?: number | IPAddress | null) {
		return super.containsSome(...toRange(start, netmaskOrEnd));
	}

	toCIDRs() {
		return this.ranges.map(([start, end]) => rangeToCIDR(start, end)).flat();
	}
}
