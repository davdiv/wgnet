import type { AcceptStringifiedBinary, DBNewPeerLink } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<AcceptStringifiedBinary<DBNewPeerLink> & { requestPeerCondition: string }>;
