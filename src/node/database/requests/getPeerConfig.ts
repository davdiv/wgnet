import type { StatementSync } from "node:sqlite";
import { parseColumns } from "../utils";

const postProcess = parseColumns("address");

export default (statement: StatementSync) =>
	({
		id,
		withSecrets,
		requestPeerCondition,
	}: {
		id: number;
		withSecrets: boolean;
		requestPeerCondition: string;
	}): {
		name: string;
		interfaceName?: string;
		listenPort?: number;
		fwMark?: number;
		privateKey?: string;
		address: string[];
		tags: string;
	} | null =>
		postProcess(statement.get({ id, withSecrets: withSecrets ? 1 : 0, requestPeerCondition }));
