import { formatBase64 } from "../../common/keys";
import type { Command } from "../command";
import { extractKey, generateKeys } from "../keys";

export default (async () => {
	console.log(formatBase64(extractKey((await generateKeys()).privateKey)));
}) satisfies Command;
