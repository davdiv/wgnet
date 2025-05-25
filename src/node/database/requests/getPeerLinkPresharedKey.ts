import type { StatementSync } from "node:sqlite";
import type { AcceptStringifiedBinary, DBPeerLink, DBPeerLinkKey, StringifiedBinary } from "../types";

export default (statement: StatementSync) =>
	(item: AcceptStringifiedBinary<DBPeerLinkKey> & { requestPeerCondition: string }): Pick<StringifiedBinary<DBPeerLink>, "presharedKey"> =>
		statement.get(item) as any;
