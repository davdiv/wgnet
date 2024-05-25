import type { DBPeer } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<Omit<DBPeer, "privateKey" | "publicKey">>;
