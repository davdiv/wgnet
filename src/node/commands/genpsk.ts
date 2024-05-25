import { formatBase64 } from "../../common/keys";
import type { Command } from "../command";
import { generate32BytesKey } from "../keys";

export default (async () => {
	console.log(formatBase64(await generate32BytesKey()));
}) satisfies Command;
