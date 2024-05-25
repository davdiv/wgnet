import type { Statement } from "better-sqlite3";
import type { AcceptStringifiedBinary, DBPeerLink, DBPeerLinkKey, StringifiedBinary } from "../types";

export default (statement: Statement) =>
	(item: AcceptStringifiedBinary<DBPeerLinkKey>): Pick<StringifiedBinary<DBPeerLink>, "presharedKey"> =>
		statement.get(item) as any;
