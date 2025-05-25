import type { StatementSync } from "node:sqlite";
import type { AcceptStringifiedBinary, DBPeer, DBPeerKey, StringifiedBinary } from "../types";

export default (statement: StatementSync) =>
	(item: AcceptStringifiedBinary<DBPeerKey> & { requestPeerCondition: string }): Pick<StringifiedBinary<DBPeer>, "privateKey"> =>
		statement.get(item) as any;
