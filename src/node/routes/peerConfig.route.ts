import fastifyPlugin from "fastify-plugin";
import { availableOutputFormats, formatConfig, outputFormatMimeType, type OutputFormat } from "../../common/wgConfig/format";
import { notFound } from "../notFound";
import { PeerAccess } from "../../common/peerConditions/accessRights";

export default fastifyPlugin(async (fastify) => {
	const { getPeerConfigPeers, getPeerConfig } = fastify.database.requests;

	fastify.get<{
		Params: {
			id: number;
			format?: OutputFormat;
		};
	}>("/api/peers/:id/config/:format?", { schema: { params: { id: { type: "number" }, format: { type: "string" } } } }, async (request, reply) => {
		const { id, format } = request.params;
		if (format && !availableOutputFormats.includes(format)) {
			return Promise.reject(notFound());
		}
		const peerConfig = getPeerConfig({ id, requestPeerCondition: request.peerCondition(PeerAccess.ReadFullConfig) });
		if (!peerConfig) {
			return Promise.reject(notFound());
		}
		const { tags, ...res } = peerConfig;
		const peers = getPeerConfigPeers(id, tags);
		const config = { ...res, peers: peers.filter((peer) => peer.allowedIPs.length > 0) };
		if (format) {
			const file = await formatConfig(format, config);
			return reply
				.status(200)
				.type(outputFormatMimeType[format] ?? "text/plain")
				.send(file);
		} else {
			return reply.status(200).send(config);
		}
	});
});
