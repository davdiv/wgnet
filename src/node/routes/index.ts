import fastifyCompress from "@fastify/compress";
import fastifyCookie from "@fastify/cookie";
import fastifyHelmet from "@fastify/helmet";
import fastifyStatic from "@fastify/static";
import type { FastifyPluginAsync } from "fastify";
import fastify from "fastify";
import fastifyPlugin from "fastify-plugin";
import { join } from "path";
import { validateColor } from "../../common/color";
import { validatePeerCondition } from "../../common/peerConditions/validate";
import { fastifyDatabase } from "../database/fastify";
import type { DatabaseConfig } from "../database/main";
import { notFound } from "../notFound";
import type { AuthenticationConfig } from "./authentication";
import auth from "./authentication";

export type ProtocolOptions = {
	http2?: boolean;
	https?: {
		cert: string;
		key: string;
	} | null;
	trustProxy?: boolean;
};

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

export const createServer = ({
	databaseConfig,
	authenticationConfig,
	protocolOptions,
}: {
	databaseConfig: DatabaseConfig;
	authenticationConfig: AuthenticationConfig;
	protocolOptions?: ProtocolOptions;
}) => {
	const server = fastify({
		...protocolOptions,
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
	server.register(fastifyHelmet, {
		contentSecurityPolicy: {
			useDefaults: false,
			directives: {
				"default-src": ["'self'"],
			},
		},
	});
	server.register(fastifyStatic, {
		root: join(import.meta.dirname, "web"),
		wildcard: false,
		preCompressed: true,
	});
	server.register(fastifyCompress);
	server.register(fastifyCookie);
	server.register(fastifyDatabase, databaseConfig);
	server.register(auth, authenticationConfig);
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
