import { describe, expect, test } from "vitest";
import type { IPRange } from "../src/common/ip";
import { CIDRToRange, IPSet, parseIP as ip, nextIP, parseIPCIDR, rangeToCIDR } from "../src/common/ip";

const range = (ip1: string, ip2 = ip1): IPRange => [ip(ip1), ip(ip2)];

describe("IPCIDR", () => {
	test("should work", () => {
		expect(parseIPCIDR("192.168.1.1/24")).toEqual([ip("192.168.1.1"), 24]);
		expect(parseIPCIDR("::/0")).toEqual([ip("::"), 0]);
	});
});

describe("nextIP", () => {
	test("add", () => {
		expect(nextIP(ip("192.168.1.1"))).toEqual(ip("192.168.1.2"));
		expect(nextIP(ip("192.168.1.255"))).toEqual(ip("192.168.2.0"));
		expect(nextIP(ip("192.168.255.255"))).toEqual(ip("192.169.0.0"));
		expect(nextIP(ip("192.168.1.1"), 255)).toEqual(ip("192.168.2.0"));
		expect(nextIP(ip("192.168.1.255"), 2)).toEqual(ip("192.168.2.1"));
		expect(() => nextIP(ip("255.255.255.255"))).toThrow("Overflowing IP");
	});
	test("remove", () => {
		expect(nextIP(ip("192.168.1.2"), -1)).toEqual(ip("192.168.1.1"));
		expect(nextIP(ip("192.168.2.0"), -1)).toEqual(ip("192.168.1.255"));
		expect(nextIP(ip("192.169.0.0"), -1)).toEqual(ip("192.168.255.255"));
		expect(nextIP(ip("192.168.2.0"), -255)).toEqual(ip("192.168.1.1"));
		expect(nextIP(ip("192.168.2.1"), -2)).toEqual(ip("192.168.1.255"));
		expect(() => nextIP(ip("0.0.0.0"), -1)).toThrow("Overflowing IP");
	});
});

describe("IPSet", () => {
	describe("add", () => {
		test("already present ip", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
		});

		test("already present range", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.10"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.add(ip("192.168.1.7"), ip("192.168.1.9"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
		});

		test("at the beginning", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.3"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.3"), range("192.168.1.5")]);
		});

		test("previous at the beginning", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.4"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.4", "192.168.1.5")]);
		});

		test("at the end", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.8")]);
		});

		test("next at the end", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.6"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.6")]);
		});

		test("from the beginning to the end", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5")]);
			expect(ipSet.add(ip("192.168.1.4"), ip("192.168.1.6"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.4", "192.168.1.6")]);
		});

		test("from the beginning to the end, replacing multiple ranges", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.9"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.9")]);
			expect(ipSet.add(ip("192.168.1.4"), ip("192.168.1.11"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.4", "192.168.1.11")]);
		});

		test("in the middle", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.10"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.10")]);
			expect(ipSet.add(ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.8"), range("192.168.1.10")]);
		});

		test("extend before", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.10"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.10")]);
			expect(ipSet.add(ip("192.168.1.4"), ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.4", "192.168.1.5"), range("192.168.1.10")]);
		});

		test("extend after", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.10"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.10")]);
			expect(ipSet.add(ip("192.168.1.10"), ip("192.168.1.11"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.10", "192.168.1.11")]);
		});
	});

	describe("remove", () => {
		test("remove from empty ipset", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.remove(ip("192.168.1.5"))).toBe(false);
			expect(ipSet.ranges).toEqual([]);
		});

		test("remove absent ip or range", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.10"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.1"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.4"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.11"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.12"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.1"), ip("192.168.1.4"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
			expect(ipSet.remove(ip("192.168.1.11"), ip("192.168.1.12"))).toBe(false);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.10")]);
		});

		test("remove from beginning", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8")]);
			expect(ipSet.remove(ip("192.168.1.5"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.6", "192.168.1.8")]);
		});

		test("remove from end", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8")]);
			expect(ipSet.remove(ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.7")]);
		});

		test("remove in the middle", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8")]);
			expect(ipSet.remove(ip("192.168.1.6"), ip("192.168.1.7"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.8")]);
		});

		test("remove exact", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8")]);
			expect(ipSet.remove(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.ranges).toEqual([]);
		});

		test("remove touching multiple ranges (beginning and end in present ranges)", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.12"), ip("192.168.1.14"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.16"), ip("192.168.1.18"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8"), range("192.168.1.12", "192.168.1.14"), range("192.168.1.16", "192.168.1.18")]);
			expect(ipSet.remove(ip("192.168.1.6"), ip("192.168.1.17"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5"), range("192.168.1.18")]);
		});

		test("remove touching multiple ranges (end in present range)", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.12"), ip("192.168.1.14"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.16"), ip("192.168.1.18"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8"), range("192.168.1.12", "192.168.1.14"), range("192.168.1.16", "192.168.1.18")]);
			expect(ipSet.remove(ip("192.168.1.9"), ip("192.168.1.17"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8"), range("192.168.1.18")]);
		});

		test("remove touching multiple ranges (beginning in present range)", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.12"), ip("192.168.1.14"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.16"), ip("192.168.1.18"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8"), range("192.168.1.12", "192.168.1.14"), range("192.168.1.16", "192.168.1.18")]);
			expect(ipSet.remove(ip("192.168.1.7"), ip("192.168.1.15"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.6"), range("192.168.1.16", "192.168.1.18")]);
		});

		test("remove touching multiple ranges (beginning and end not in present range)", () => {
			const ipSet = new IPSet();
			expect(ipSet.ranges).toEqual([]);
			expect(ipSet.add(ip("192.168.1.5"), ip("192.168.1.8"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.12"), ip("192.168.1.14"))).toBe(true);
			expect(ipSet.add(ip("192.168.1.16"), ip("192.168.1.18"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.5", "192.168.1.8"), range("192.168.1.12", "192.168.1.14"), range("192.168.1.16", "192.168.1.18")]);
			expect(ipSet.remove(ip("192.168.1.4"), ip("192.168.1.15"))).toBe(true);
			expect(ipSet.ranges).toEqual([range("192.168.1.16", "192.168.1.18")]);
		});
	});
});

describe("cidrToRange", () => {
	test("should work", () => {
		expect(CIDRToRange(ip("192.168.1.1"), 24)).toEqual(range("192.168.1.0", "192.168.1.255"));
		expect(CIDRToRange(ip("192.168.1.10"), 32)).toEqual(range("192.168.1.10"));
		expect(CIDRToRange(ip("10.5.1.2"), 8)).toEqual(range("10.0.0.0", "10.255.255.255"));
		expect(CIDRToRange(ip("192.168.1.10"), 31)).toEqual(range("192.168.1.10", "192.168.1.11"));
		expect(CIDRToRange(ip("192.168.1.11"), 31)).toEqual(range("192.168.1.10", "192.168.1.11"));
	});
});

describe("rangeToCidr", () => {
	test("should work", () => {
		expect(rangeToCIDR(...range("192.168.1.1"))).toEqual([[ip("192.168.1.1"), 32]]);
		expect(rangeToCIDR(...range("192.168.1.0", "192.168.1.255"))).toEqual([[ip("192.168.1.0"), 24]]);
		expect(rangeToCIDR(...range("192.168.0.254", "192.168.1.255"))).toEqual([
			[ip("192.168.0.254"), 31],
			[ip("192.168.1.0"), 24],
		]);
		expect(rangeToCIDR(...range("10.0.0.0", "10.0.2.50"))).toEqual([
			[ip("10.0.0.0"), 23],
			[ip("10.0.2.0"), 27],
			[ip("10.0.2.32"), 28],
			[ip("10.0.2.48"), 31],
			[ip("10.0.2.50"), 32],
		]);
	});
});
