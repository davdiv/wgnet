export type BinaryKey = Buffer | Uint8Array;
export type Base64OrBinaryKey = BinaryKey | string;

export const invalidKey = () => {
	const error = new Error("Invalid key");
	(error as any).statusCode = 400;
	return error;
};

export const parseBase64 = import.meta.env.SSR
	? (content: Base64OrBinaryKey) => (typeof content === "string" ? Buffer.from(content, "base64") : content)
	: (content: Base64OrBinaryKey) => {
			if (typeof content === "string") {
				const bytes = atob(content);
				const res = new Uint8Array(bytes.length);
				for (let i = 0, l = bytes.length; i < l; i++) {
					res[i] = bytes.charCodeAt(i);
				}
				return res;
			}
			return content;
		};

export const formatBase64 = import.meta.env.SSR
	? (buffer: Base64OrBinaryKey) => (typeof buffer === "string" ? buffer : (Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer.buffer)).toString("base64"))
	: (buffer: Base64OrBinaryKey) => (typeof buffer === "string" ? buffer : btoa(String.fromCharCode(...buffer)));

export const parse32BytesBase64 = (key: Base64OrBinaryKey) => {
	const result = typeof key === "string" ? parseBase64(key.trim()) : key;
	if (result.length !== 32) {
		throw invalidKey();
	}
	return result;
};
