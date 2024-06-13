import type { AcceptStringifiedBinary, DBNewPeerAllowedIp } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<AcceptStringifiedBinary<DBNewPeerAllowedIp> & { requestPeerCondition: string }>;
