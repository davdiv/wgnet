import type { AcceptStringifiedBinary, DBNewPeerAllowedIp } from "../types";
import { createRunStatement } from "../utils";

export default createRunStatement<AcceptStringifiedBinary<DBNewPeerAllowedIp>>;
