import { readFile, writeFile } from "fs/promises";

const main = async () => {
	const config = JSON.parse(await readFile("config.json", "utf8"));
	if (config.realm) {
		await writeFile(
			"config.json",
			JSON.stringify({
				authority: new URL(`./realms/${config.realm}`, config["auth-server-url"]),
				client_id: config.resource,
				client_secret: config.credentials.secret,
			}),
		);
	}
};
main();
