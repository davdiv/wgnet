import type { StatementSync } from "node:sqlite";
import type { DBPeer, DBPeerAllowedIp, DBPeerEndpoint, DBPeerIp, StringifiedBinary } from "../types";
import { parseColumns } from "../utils";

const postProcess = parseColumns("tags", "addresses", "endpoints", "allowedIps");

export interface PeerInfo extends StringifiedBinary<Omit<DBPeer, "privateKey" | "tags">> {
	hasPrivateKey: 0 | 1;
	tags: number[];
	addresses: Omit<StringifiedBinary<DBPeerIp>, "peer">[];
	endpoints: Omit<DBPeerEndpoint, "peer">[];
	allowedIps: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">[];
}

export default (statement: StatementSync) =>
	({ requestPeerCondition }: { requestPeerCondition: string }): PeerInfo[] =>
		statement.all({ requestPeerCondition }).map(postProcess);
