import type { StatementSync } from "node:sqlite";
import { parseColumns } from "../utils";

const postProcess = parseColumns("allowedIPs");

export default (statement: StatementSync) =>
	(
		id: number,
		peerTags: string,
	): {
		publicKey: string;
		presharedKey: string | null;
		allowedIPs: string[];
		endpoint: string | null;
	}[] =>
		statement.all({ id, peerTags }).map(postProcess);
