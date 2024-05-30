import fastifyJwt from "@fastify/jwt";
import fastifyStatic from "@fastify/static";
import fastifyCookie from "@fastify/cookie";
import fastifyCompress from "@fastify/compress";
import type { FastifyPluginAsync } from "fastify";
import fastify from "fastify";
import fastifyPlugin from "fastify-plugin";
import { join } from "path";
import { fastifyDatabase } from "../database/fastify";
import type { DatabaseConfig } from "../database/main";
import { validatePeerCondition } from "../../common/peerConditions/validate";
import { notFound } from "../notFound";
import { validateColor } from "../../common/color";

const allRoutes = Object.values(
	import.meta.glob<FastifyPluginAsync>("./*.route.ts", {
		import: "default",
		eager: true,
	}),
);

export const routes = fastifyPlugin(async (fastify) => {
	for (const route of allRoutes) {
		fastify.register(route);
	}
});

export const createServer = ({ databaseConfig, jwtKey }: { databaseConfig: DatabaseConfig; jwtKey: Buffer }) => {
	const server = fastify({
		logger: true,
		ajv: {
			customOptions: {
				formats: {
					peerCondition: validatePeerCondition,
					color: validateColor,
				},
			},
		},
	});
	server.register(fastifyStatic, {
		root: join(import.meta.dirname, "web"),
		wildcard: false,
		preCompressed: true,
	});
	server.register(fastifyCompress);
	const algorithm = "HS256";
	server.register(fastifyCookie);
	server.register(fastifyJwt, {
		cookie: {
			cookieName: "auth",
			signed: false,
		},
		secret: jwtKey as Buffer,
		sign: {
			algorithm,
			expiresIn: "10m",
		},
		verify: {
			algorithms: [algorithm],
			onlyCookie: true,
		},
	});
	server.register(fastifyDatabase, databaseConfig);
	server.register(routes);
	server.register(
		async (fastify) => {
			fastify.setNotFoundHandler(async (request, reply) => Promise.reject(notFound()));
		},
		{ prefix: "/api" },
	);
	server.setNotFoundHandler(async (request, reply) => {
		return await reply.sendFile("index.html");
	});
	return server;
};
