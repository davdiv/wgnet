import type { StatementSync } from "node:sqlite";
import type { DBPeerLink } from "../types";

export interface PeerLinkInfo extends Omit<DBPeerLink, "presharedKey"> {
	hasPSK: 0 | 1;
}

export default (statement: StatementSync) =>
	({ requestPeerCondition }: { requestPeerCondition: string }): PeerLinkInfo[] =>
		statement.all({ requestPeerCondition }) as any;
