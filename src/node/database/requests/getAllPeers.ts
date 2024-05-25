import type { Statement } from "better-sqlite3";
import type { DBPeer, DBPeerAllowedIp, DBPeerEndpoint, DBPeerIp, StringifiedBinary } from "../types";
import { parseColumns } from "../utils";

const postProcess = parseColumns("tags", "addresses", "endpoints", "allowedIps");

export interface PeerInfo extends StringifiedBinary<Omit<DBPeer, "privateKey">> {
	hasPrivateKey: 0 | 1;
	tags: number[];
	addresses: Omit<StringifiedBinary<DBPeerIp>, "peer">[];
	endpoints: Omit<DBPeerEndpoint, "peer">[];
	allowedIps: Omit<StringifiedBinary<DBPeerAllowedIp>, "peer">[];
}

export default (statement: Statement) => (): PeerInfo[] => statement.all().map(postProcess);
