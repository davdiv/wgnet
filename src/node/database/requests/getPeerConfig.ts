import type { StatementSync } from "node:sqlite";
import { parseColumns } from "../utils";

const postProcess = parseColumns("address");

export default (statement: StatementSync) =>
	({
		id,
		requestPeerCondition,
	}: {
		id: number;
		requestPeerCondition: string;
	}): {
		interfaceName?: string;
		listenPort?: number;
		fwMark?: number;
		privateKey?: string;
		address: string[];
		tags: string;
	} | null =>
		postProcess(statement.get({ id, requestPeerCondition }));
