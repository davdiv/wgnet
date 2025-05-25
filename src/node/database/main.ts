import { DatabaseSync } from "node:sqlite";
import type { StatementSync } from "node:sqlite";
import { existsSync } from "fs";
import { formatIP, formatIPCIDR, parseIP } from "../../common/ip";
import { formatBase64, parse32BytesBase64, type BinaryKey } from "../../common/keys";
import { matchPeerCondition } from "../../common/peerConditions/evaluate";
import { cipher, decipher } from "../encryption";
import { aggregateIPCIDR } from "./aggregateIPCIDR";
import { aggregateKeepTopPriority } from "./aggregateKeepTopPriority";
import type { RequestsTypes } from "./requestsTypes";
import schema from "./schema.sql?raw";

export const DB_CURRENT_VERSION = "wgnet-v0";

const sqlRequests = Object.entries(
	import.meta.glob<string>("./requests/*.sql", {
		query: "?raw",
		import: "default",
		eager: true,
	}),
).map(([name, value]) => [name.slice(11, -4), value]);
const tsWrapper = Object.fromEntries(
	Object.entries(
		import.meta.glob<(statement: StatementSync) => any>("./requests/*.ts", {
			eager: true,
			import: "default",
		}),
	).map(([name, value]) => [name.slice(11, -3), value]),
);

const failReadonly = () => {
	throw new Error("Readonly database");
};

const checkInit = (db: DatabaseSync, fileName: string) => {
	let result: undefined | { wgnetVersion: string };
	try {
		result = db.prepare("SELECT wgnetVersion FROM version").get() as any;
	} catch {
		throw new Error(`File '${fileName}' does not contain a wgnet database.`);
	}
	if (result?.wgnetVersion != DB_CURRENT_VERSION) {
		throw new Error(`File '${fileName}' contains an incompatible version of a wgnet database, expected ${DB_CURRENT_VERSION}, found ${result?.wgnetVersion}`);
	}
};

export interface DatabaseConfig {
	database: string;
	secret: BinaryKey;
	readonly?: boolean;
	fileMustExist?: boolean;
}

export const openDatabase = (options: DatabaseConfig) => {
	const encryptionKey = options.secret;
	const fileName = options.database;
	const fileMustExist = options.fileMustExist || options.readonly || existsSync(fileName);
	const readOnly = !!options.readonly;
	const db = new DatabaseSync(fileName, { readOnly });
	db.exec("PRAGMA journal_mode = WAL");
	// cipher is not deterministic as it contains a random part
	db.function("cipher", { deterministic: false, directOnly: true }, (blob: any) => (readOnly ? failReadonly() : blob ? cipher(blob, encryptionKey) : null));
	db.function("decipher", { deterministic: true, directOnly: true }, (blob: any) => (blob ? decipher(blob, encryptionKey) : null));
	db.function("matchPeerCondition", { deterministic: true, directOnly: true }, matchPeerCondition as any);
	db.function("parse32BytesBase64", { deterministic: true, directOnly: true }, (strOrBlob: any) => (strOrBlob ? parse32BytesBase64(strOrBlob) : null));
	db.function("parseIP", { deterministic: true, directOnly: true }, (strOrBlob: any) => (strOrBlob ? parseIP(strOrBlob) : null));
	db.function("formatBase64", { deterministic: true, directOnly: true }, (blob: any) => (blob ? formatBase64(blob) : null));
	db.function("formatIP", { deterministic: true, directOnly: true }, (blob: any) => (blob ? formatIP(blob) : null));
	db.function("formatIPCIDR", { deterministic: true, directOnly: true }, (blob: any, netmask: any) => (blob ? formatIPCIDR([blob, netmask]) : null));
	(db as any).aggregate("aggregateIPCIDR", { deterministic: true, directOnly: true, varargs: true, ...(aggregateIPCIDR as any) });
	(db as any).aggregate("aggregateKeepTopPriority", { deterministic: true, directOnly: true, ...(aggregateKeepTopPriority as any) });
	if (fileMustExist) {
		checkInit(db, fileName);
	} else {
		db.exec(`${schema}\nINSERT INTO version (wgnetVersion) VALUES ('${DB_CURRENT_VERSION}');`);
	}

	return {
		readonly: readOnly,
		requests: Object.fromEntries(
			sqlRequests.map(([entry, value]) => {
				const prepare = db.prepare(value);
				const wrapper = tsWrapper[entry];
				return [entry, wrapper(prepare)];
			}),
		) as RequestsTypes,
		close: () => {
			db.close();
		},
	};
};

export type WgnetDatabase = ReturnType<typeof openDatabase>;
