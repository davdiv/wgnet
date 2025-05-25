import { readFile, writeFile } from "fs/promises";

const main = async () => {
	const config = JSON.parse(await readFile("config.json", "utf8"));
	if (config.realm) {
		const realm = new URL(`./realms/${config.realm}`, config["auth-server-url"]);
		if (realm.hostname === "[::1]") {
			realm.hostname = "127.0.0.1";
		}
		await writeFile(
			"config.json",
			JSON.stringify({
				authority: realm,
				client_id: config.resource,
				client_secret: config.credentials.secret,
			}),
		);
	}
};
main();
