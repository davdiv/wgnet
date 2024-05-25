import type { Statement } from "better-sqlite3";
import type { AcceptStringifiedBinary, DBPeer, DBPeerKey, StringifiedBinary } from "../types";

export default (statement: Statement) =>
	(item: AcceptStringifiedBinary<DBPeerKey>): Pick<StringifiedBinary<DBPeer>, "privateKey"> =>
		statement.get(item) as any;
