import type { DBPeerEndpointKey } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<DBPeerEndpointKey & { requestPeerCondition: string }>;
