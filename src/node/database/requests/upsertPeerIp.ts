import type { AcceptStringifiedBinary, DBNewPeerIp } from "../types";
import { createRunStatement } from "../utils";

export default createRunStatement<AcceptStringifiedBinary<DBNewPeerIp>>;
