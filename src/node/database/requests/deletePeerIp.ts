import type { AcceptStringifiedBinary, DBPeerIpKey } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<AcceptStringifiedBinary<DBPeerIpKey> & { requestPeerCondition: string }>;
