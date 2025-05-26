import type { StatementSync } from "node:sqlite";
import { parseColumns } from "../utils";

const postProcess = parseColumns("allowedIPs");

export default (statement: StatementSync) =>
	(
		id: number,
		withSecrets: boolean,
		peerTags: string,
	): {
		name: string;
		publicKey: string;
		hasPSK: 0 | 1;
		presharedKey: string | null;
		allowedIPs: string[];
		endpoint: string | null;
	}[] =>
		statement.all({ id, withSecrets: withSecrets ? 1 : 0, peerTags }).map(postProcess);
