import type { DBNewPeerEndpoint } from "../types";
import { createRunStatement } from "../utils";

export default createRunStatement<DBNewPeerEndpoint>;
