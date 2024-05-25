import { mkdtemp } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const mkTempDir = async () => await mkdtemp(join(tmpdir(), "wgnet-test-"));
