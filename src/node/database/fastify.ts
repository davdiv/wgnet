import plugin from "fastify-plugin";
import type { DatabaseConfig } from "./main";
import { openDatabase } from "./main";

declare module "fastify" {
	interface FastifyInstance {
		database: ReturnType<typeof openDatabase>;
	}
}

export const fastifyDatabase = plugin(async (fastify, options: DatabaseConfig) => {
	const database = openDatabase(options);
	fastify.decorate("database", database);
	fastify.addHook("onClose", () => {
		fastify.log.info("Closing database");
		database.close();
	});
});
