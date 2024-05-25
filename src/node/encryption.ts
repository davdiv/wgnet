import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import type { BinaryKey } from "../common/keys";

const algorithm = "aes-256-gcm";
const ivLength = 12;
const authTagLength = 16;

export const cipher = (clearText: Buffer, secretKey: BinaryKey) => {
	const iv = randomBytes(ivLength);
	const cipherObj = createCipheriv(algorithm, secretKey, iv, { authTagLength });
	const output = [iv, cipherObj.update(clearText)];
	output.push(cipherObj.final(), cipherObj.getAuthTag());
	return Buffer.concat(output);
};

export const decipher = (cipheredText: Buffer, secretKey: BinaryKey) => {
	const decipherObj = createDecipheriv(algorithm, secretKey, cipheredText.subarray(0, ivLength), { authTagLength });
	decipherObj.setAuthTag(cipheredText.subarray(-authTagLength));
	const output = [decipherObj.update(cipheredText.subarray(ivLength, -authTagLength)), decipherObj.final()];
	return Buffer.concat(output);
};
