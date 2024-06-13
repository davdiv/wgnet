import type { AcceptStringifiedBinary, DBNewPeerIp } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<AcceptStringifiedBinary<DBNewPeerIp> & { requestPeerCondition: string }>;
