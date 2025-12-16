export const readStdin = () =>
	new Promise<string>((resolve, reject) => {
		const allData: Buffer[] = [];
		process.stdin.on("data", (data) => allData.push(data as Buffer));
		process.stdin.on("end", () => resolve(Buffer.concat(allData).toString("utf-8")));
		process.stdin.on("error", reject);
	});

export const parseJsonStdin = async () => JSON.parse(await readStdin());
