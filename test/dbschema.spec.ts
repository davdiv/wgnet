import { test } from "vitest";
import { openDatabase } from "../src/node/database/main";
import { generate32BytesKey } from "../src/node/keys";
import { join } from "path";
import { mkTempDir } from "./utils";
import { rm } from "fs/promises";

// this simple checks that the schema and all requests are valid
test("create, close and reopen database", async () => {
	const secret = generate32BytesKey();
	const tempDir = await mkTempDir();
	try {
		const file = join(tempDir, "wgnet.db");
		const db1 = openDatabase({
			database: file,
			secret,
		});
		db1.close();
		const db2 = openDatabase({
			database: file,
			secret,
		});
		db2.close();
	} finally {
		await rm(tempDir, { recursive: true });
	}
});
