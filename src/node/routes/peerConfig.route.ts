import type { FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { availableOutputFormats, formatConfig, isSecretOutputFormat, outputFormatMimeType, type OutputFormat } from "../../common/wgConfig/format";
import { notFound } from "../notFound";
import { readFullConfigWithoutSecrets, readFullConfigWithSecrets } from "../../common/peerConditions/accessRights";
import { jsonSchema } from "../database/types";
import type { WgConfig } from "../../common/wgConfig/type";

export default fastifyPlugin(async (fastify) => {
	const { getPeerConfigPeers, getPeerConfig } = fastify.database.requests;

	const getFullConfig = async (request: FastifyRequest, id: number, withSecrets: boolean): Promise<WgConfig> => {
		const requestPeerCondition = request.peerCondition(withSecrets ? readFullConfigWithSecrets : readFullConfigWithoutSecrets);
		const peerConfig = getPeerConfig({ id, withSecrets, requestPeerCondition });
		if (!peerConfig) {
			return Promise.reject(notFound());
		}
		const { tags, ...res } = peerConfig;
		const peers = getPeerConfigPeers(id, withSecrets, tags);
		const config = { ...res, peers: peers.filter((peer) => peer.allowedIPs.length > 0) };
		return config;
	};

	fastify.get<{
		Params: {
			id: number;
			format: OutputFormat;
		};
	}>(
		"/api/peers/:id/config/:format",
		{
			schema: {
				params: jsonSchema({ id: { type: "number" }, format: { type: "string" } }),
			},
		},
		async (request, reply) => {
			const { id, format } = request.params;
			if (!availableOutputFormats.includes(format)) {
				return Promise.reject(notFound());
			}
			const withSecrets = isSecretOutputFormat(format);
			const config = await getFullConfig(request, id, withSecrets);
			const file = await formatConfig(format, config);
			return reply
				.status(200)
				.type(outputFormatMimeType[format] ?? "text/plain")
				.send(file);
		},
	);

	fastify.get<{
		Params: {
			id: number;
		};
		Querystring: {
			withSecrets: boolean;
		};
	}>(
		"/api/peers/:id/config",
		{
			schema: {
				params: jsonSchema({ id: { type: "number" } }),
				querystring: jsonSchema({ withSecrets: { type: "boolean" } }),
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const { withSecrets } = request.query;
			const config = await getFullConfig(request, id, withSecrets);
			return reply.status(200).send(config);
		},
	);
});
