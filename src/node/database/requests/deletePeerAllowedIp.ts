import type { AcceptStringifiedBinary, DBPeerAllowedIpKey } from "../types";
import { createRunStatementCheckChange } from "../utils";

export default createRunStatementCheckChange<AcceptStringifiedBinary<DBPeerAllowedIpKey>>;
