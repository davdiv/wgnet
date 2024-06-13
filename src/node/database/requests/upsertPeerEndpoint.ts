import type { DBNewPeerEndpoint } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<DBNewPeerEndpoint & { requestPeerCondition: string }>;
