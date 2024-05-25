import type { KeyObject } from "crypto";
import { createPrivateKey, createPublicKey, generateKeyPair as generateKeyPairCB, randomBytes } from "crypto";
import { promisify } from "util";
import type { BinaryKey } from "../common/keys";
import { formatBase64, invalidKey, parse32BytesBase64 } from "../common/keys";
const generateKeyPair = promisify(generateKeyPairCB);

const createPrivKey = (key: Buffer) => createPrivateKey({ key, format: "der", type: "pkcs8" });
const createPubKey = (key: Buffer) => createPublicKey({ key, format: "der", type: "spki" });

const bufferEnd = (buffer: Buffer) => buffer.subarray(buffer.length - 32);

export const extractKey = (key: KeyObject) =>
	bufferEnd(
		key.export(
			key.type === "public"
				? {
						type: "spki",
						format: "der",
					}
				: {
						type: "pkcs8",
						format: "der",
					},
		),
	);

const createParser = (header: Buffer, factory: typeof createPubKey | typeof createPrivKey) => (key: string | BinaryKey) => {
	const buffer = parse32BytesBase64(key);
	const res = factory(Buffer.concat([header, buffer]));
	const extracted = extractKey(res);
	if (!extracted.equals(buffer)) {
		throw invalidKey();
	}
	return res;
};

export const parsePrivateKey = createParser(Buffer.from("302e020100300506032b656e04220420", "hex"), createPrivKey);
export const parsePublicKey = createParser(Buffer.from("302a300506032b656e032100", "hex"), createPubKey);
export const derivePublicKey = (privateKey: KeyObject): KeyObject => createPublicKey(privateKey);
export const generateKeys = () => generateKeyPair("x25519");

export const generate32BytesKey = () => randomBytes(32);

export const pubkey = (privateKey: string | BinaryKey) => formatBase64(extractKey(derivePublicKey(parsePrivateKey(privateKey))));
