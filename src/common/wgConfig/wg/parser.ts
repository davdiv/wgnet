import { parseIPCIDR } from "../../ip";
import { parse32BytesBase64 } from "../../keys";
import type { WgConfig, WgConfigPeer } from "../type";

const lineBreakRegExp = /\r\n|\n\r|\r|\n/;

const interfaceSectionLine = "[Interface]";
const peerSectionLine = "[Peer]";
const propertyLine = /^(\w+)\s*=\s*(.*)$/;

type SectionName = typeof interfaceSectionLine | typeof peerSectionLine;

type ParserType<T> = (value: string, existingValue: T | undefined) => T;

const unknownPropertyParser: ParserType<never> = (value, existingValue) => {
	throw new Error(`Unknown property`);
};

const defaultParser: ParserType<any> = (value, existingValue) => {
	if (existingValue != null) {
		throw new Error(`Property cannot be specified multiple times!`);
	}
	return value;
};

const numberParser: ParserType<number> = (value, existingValue) => {
	defaultParser(value, existingValue);
	if (value === "off") {
		return 0;
	}
	const numValue = +value;
	if (isNaN(numValue)) {
		throw new Error(`Expected a number`);
	}
	return numValue;
};

const commaSeparatedParser =
	<T>(individualParser: ParserType<T>): ParserType<T[]> =>
	(value, existingValue) => {
		const result = existingValue ?? [];
		result.push(...value.split(",").map((part) => individualParser(part.trim(), undefined)));
		return result;
	};

const commaSeparatedCIDRParser = commaSeparatedParser(parseIPCIDR);

const propertiesParser: Record<SectionName, { [key: string]: ParserType<any> }> = {
	[interfaceSectionLine]: {
		FwMark: numberParser,
		ListenPort: numberParser,
		PrivateKey: parse32BytesBase64,
		Address: commaSeparatedCIDRParser,
	},
	[peerSectionLine]: {
		AllowedIPs: commaSeparatedCIDRParser,
		Endpoint: defaultParser,
		PersistentKeepalive: numberParser,
		PresharedKey: parse32BytesBase64,
		PublicKey: parse32BytesBase64,
	},
};

export const parseWgConfig = (config: string) => {
	let lineNumber = 0;
	const lines = config.split(lineBreakRegExp);
	let interfaceSection: WgConfig | undefined;
	const peerSections: WgConfigPeer[] = [];
	let currentSection: WgConfigPeer | WgConfig | undefined;
	let currentSectionName: SectionName | null = null;

	for (let line of lines) {
		lineNumber++;
		line = line.split("#")[0].trim(); // remove comments
		if (line) {
			try {
				if (interfaceSectionLine === line) {
					currentSection = {};
					currentSectionName = line;
					if (interfaceSection) {
						throw new Error(`Only one [Interface] section is allowed`);
					}
					interfaceSection = currentSection as WgConfig;
				} else if (peerSectionLine === line) {
					currentSection = {};
					currentSectionName = line;
					peerSections.push(currentSection as WgConfigPeer);
				} else {
					const match = propertyLine.exec(line);
					if (match) {
						if (!currentSectionName || !currentSection) {
							throw new Error(`Invalid property outside a section`);
						}
						const property = match[1];
						const parser = propertiesParser[currentSectionName][property] ?? unknownPropertyParser;
						const lowerCaseProperty = `${property[0].toLowerCase()}${property.slice(1)}`;
						(currentSection as any)[lowerCaseProperty] = parser(match[2], (currentSection as any)[lowerCaseProperty]);
					} else {
						throw new Error(`Unrecognized line`);
					}
				}
			} catch (error) {
				throw new Error(`${(error as any)?.message ?? error}\nwhile parsing line ${lineNumber} of Wireguard config${currentSectionName ? ` in section ${currentSectionName}` : ""}: ${line}`);
			}
		}
	}

	if (!interfaceSection) {
		interfaceSection = {};
	}

	if (peerSections.length > 0) {
		interfaceSection.peers = peerSections;
	}
	return interfaceSection;
};
