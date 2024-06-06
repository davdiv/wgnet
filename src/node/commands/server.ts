import { readFile } from "fs/promises";
import open from "open";
import { Readline, createInterface as createReadline, type Interface as ReadlineInterface } from "readline/promises";
import type { Writable } from "stream";
import yargs from "yargs";
import { formatBase64, parse32BytesBase64 } from "../../common/keys";
import type { Command } from "../command";
import { generate32BytesKey } from "../keys";
import { createServer } from "../routes";

const askEncryptionKey = async (rl: ReadlineInterface, output: Writable, cursorControl: Readline, readonly: boolean) => {
	cursorControl.cursorTo(0, 0);
	cursorControl.clearScreenDown();
	await cursorControl.commit();
	rl.once("history", (history) => history.pop());
	output.write(`Please provide the encryption key (32 bytes base64 string) and press ENTER.\n`);
	output.write(readonly ? `If you do not want to access encrypted content, directly press ENTER.\n` : `If you want to generate a new key, directly press ENTER.\n`);
	output.write(`Access to existing encrypted data will fail if a different encryption key is used.\n`);
	let res = await rl.question("> ");
	cursorControl.cursorTo(0, 0);
	cursorControl.clearScreenDown();
	await cursorControl.commit();
	if (!res) {
		res = formatBase64(generate32BytesKey());
		if (!readonly) {
			output.write(`Generated key: ${res}\n`);
			output.write(`Please keep a copy of it and provide it the next time you start wgnet server with this database.\nPress ENTER to hide the key and continue.\n`);
			await rl.question("> ");
			cursorControl.cursorTo(0, 0);
			cursorControl.clearScreenDown();
			await cursorControl.commit();
		}
	}
	return res;
};

export default (async (args) => {
	const params = await yargs(args)
		.scriptName("wgnet server")
		.env("WGNET")
		.usage("$0: start a web server")
		.options({
			database: {
				describe: "Path to the SQLite database file to use",
				type: "string",
				default: "wgnet.db",
			},
			readonly: {
				describe: "Prevent modifications on the database",
				type: "boolean",
				default: false,
			},
			host: {
				describe: "Host to listen",
				type: "string",
				default: "localhost",
			},
			port: {
				describe: "Port to listen",
				type: "number",
				default: 3000,
			},
			"trust-proxy": {
				describe: "Trust proxy headers.",
				type: "boolean",
				default: false,
			},
			"public-url": {
				describe: "Public URL of the server.",
				type: "string",
			},
			http2: {
				describe: "Whether to enable HTTP/2",
				type: "boolean",
				default: false,
			},
			"https-key": {
				describe:
					"Path to a file in PEM format containing the private key(s) to be used by the HTTPS server. When specified, HTTPS is enabled. The corresponding certificate chain(s) must be provided either in the same file or in the file specified by --https-certificate.",
				type: "string",
			},
			"https-certificate": {
				describe:
					"Path to a file in PEM format containing the certificate chain(s) to be used by the HTTPS server. If this option is specified, --https-key must also be specified to provide the corresponding key(s).",
				type: "string",
			},
			"database-key": {
				describe: "Path to a file containing the 32 bytes base64 encryption key for credentials in the database.",
				type: "string",
			},
			"jwt-key": {
				describe: "Path to a file containing the 32 bytes base64 secret key to sign and verify Json Web Tokens",
				type: "string",
			},
			open: {
				describe: "Whether to automatically open the server URL in the default browser when ready.",
				type: "boolean",
				default: true,
			},
		})
		.strict().argv;
	let databaseKey = params.databaseKey ? await readFile(params.databaseKey, "utf8") : null;
	const jwtKey = params.jwtKey ? await readFile(params.jwtKey, "utf8") : null;
	const publicUrl = params.publicUrl;
	let https;
	if (params.httpsCertificate || params.httpsKey) {
		if (!params.httpsKey) {
			throw new Error("--https-key must be specified when specifying --https-certificate");
		}
		const httpsKey = await readFile(params.httpsKey, "utf8");
		const httpsCertificate = params.httpsCertificate ? await readFile(params.httpsCertificate, "utf8") : null;
		https = {
			cert: httpsCertificate ?? httpsKey,
			key: httpsKey,
		};
	}
	const closeController = new AbortController();
	const exitHandler = async () => closeController.abort();
	process.on("SIGINT", exitHandler);
	process.on("SIGTERM", exitHandler);
	const output = process.stderr;
	const cursorControl = new Readline(output);
	const rl = createReadline(process.stdin, output);
	const closeHandler = () => {
		rl.close();
		exitHandler();
	};
	rl.on("SIGINT", closeHandler);
	if (!databaseKey) {
		databaseKey = await askEncryptionKey(rl, output, cursorControl, params.readonly);
	}
	const server = createServer({
		protocolOptions: {
			http2: params.http2,
			https,
			trustProxy: params.trustProxy,
		},
		jwtKey: jwtKey ? (parse32BytesBase64(jwtKey) as Buffer) : generate32BytesKey(),
		databaseConfig: {
			database: params.database,
			secret: parse32BytesBase64(databaseKey),
			readonly: params.readonly,
		},
	});
	const address = await server.listen({ host: params.host, port: params.port, signal: closeController.signal });
	const createConnectionURL = () => new URL(`/login/${server.jwt.sign({})}`, publicUrl ?? address).href;
	const helpText = `The following commands are available:
"url": Creates a new connection URL and display it.
"open": Creates a new connection URL and open it in the default web brower.
"exit": Closes the web server.
Type any of those commands and press enter to execute it.\n\n`;
	rl.on("line", (line) => {
		switch (line) {
			case "url":
				output.write(`${createConnectionURL()}\n`);
				break;
			case "open":
				open(createConnectionURL());
				break;
			case "exit":
				closeHandler();
				break;
			default:
				output.write(helpText);
		}
	});
	if (params.open) {
		open(createConnectionURL());
	} else {
		output.write(helpText);
	}
}) satisfies Command;
