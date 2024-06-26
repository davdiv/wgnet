import type { DBPeer } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<Pick<DBPeer, "id" | "privateKey" | "publicKey"> & { requestPeerCondition: string }>;
