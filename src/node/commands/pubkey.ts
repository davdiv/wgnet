import type { Command } from "../command";
import { pubkey } from "../keys";
import { readStdin } from "../readStdin";

export default (async () => {
	console.log(pubkey(await readStdin()));
}) satisfies Command;
