import type { Statement } from "better-sqlite3";
import type { DBPeerLink } from "../types";

export interface PeerLinkInfo extends Omit<DBPeerLink, "presharedKey"> {
	hasPSK: 0 | 1;
}

export default (statement: Statement) =>
	({ requestPeerCondition }: { requestPeerCondition: string }): PeerLinkInfo[] =>
		statement.all({ requestPeerCondition }) as any;
