import type { Statement } from "better-sqlite3";
import { parseColumns } from "../utils";

const postProcess = parseColumns("allowedIPs");

export default (statement: Statement) =>
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
