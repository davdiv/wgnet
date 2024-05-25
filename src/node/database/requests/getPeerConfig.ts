import type { Statement } from "better-sqlite3";
import { parseColumns } from "../utils";

const postProcess = parseColumns("address");

export default (statement: Statement) =>
	(
		id: number,
	): {
		interfaceName?: string;
		listenPort?: number;
		fwMark?: number;
		privateKey?: string;
		address: string[];
		tags: string;
	} | null =>
		postProcess(statement.get(id));
