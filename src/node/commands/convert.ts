import yargs from "yargs";
import { type OutputFormat, availableOutputFormats, formatConfig } from "../../common/wgConfig/format";
import type { Command } from "../command";
import { readStdin } from "../readStdin";

const inputFormats = {
	wg: async () => (await import("../../common/wgConfig/wg/parser")).parseWgConfig,
};

export default (async (args) => {
	const params = await yargs(args)
		.scriptName("wgnet convert")
		.env("WGNET")
		.usage("$0: convert from one wireguard config format to another")
		.options({
			"input-format": {
				alias: "i",
				type: "string",
				default: "wg",
				choices: Object.keys(inputFormats),
			},
			"output-format": {
				alias: "o",
				type: "string",
				default: "wg",
				choices: availableOutputFormats,
			},
		})
		.strict().argv;
	const input = await readStdin();
	const parser = await inputFormats[params.inputFormat as keyof typeof inputFormats]();
	const config = await parser(input);
	console.log(await formatConfig(params.outputFormat as OutputFormat, config));
}) satisfies Command;
