import type { AcceptStringifiedBinary, DBNewPeerLink } from "../types";
import { createRunStatement } from "../utils";

export default createRunStatement<AcceptStringifiedBinary<DBNewPeerLink>>;
