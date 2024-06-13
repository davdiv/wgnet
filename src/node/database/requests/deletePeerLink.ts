import type { DBPeerLinkKey } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<DBPeerLinkKey & { requestPeerCondition: string }>;
