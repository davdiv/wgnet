import type { Command } from "./command";

const commands = Object.fromEntries(
	Object.entries(
		import.meta.glob<Command>("./commands/*.ts", {
			import: "default",
		}),
	).map(([entry, value]) => [entry.slice(11, -3), value]),
);

const main = async ([commandName, ...args]: string[]) => {
	const commandLoader = commandName && commands[commandName];
	if (!commandLoader) {
		console.error(`Missing command or unknown command name.\nAvailable commands:\n - ${Object.keys(commands).join("\n - ")}`);
		process.exit(1);
	}
	const command = await commandLoader();
	await command(args);
};

main(process.argv.slice(2));
