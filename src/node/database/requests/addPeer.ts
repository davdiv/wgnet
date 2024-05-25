import type { AcceptStringifiedBinary, DBNewPeer } from "../types";
import { createRunStatementReturnId } from "../utils";

export default createRunStatementReturnId<AcceptStringifiedBinary<DBNewPeer>>;
