import fastifyPlugin from "fastify-plugin";
import { PeerAccess } from "../../common/peerConditions/accessRights";

export default fastifyPlugin(async (fastify) => {
	const { getAllPeers, getAllPeerLinks, getAllTags } = fastify.database.requests;

	fastify.get("/api/peers", async (request, reply) => {
		return reply.code(200).send(getAllPeers({ requestPeerCondition: request.peerCondition(PeerAccess.ReadOwnConfig) }));
	});

	fastify.get("/api/peerLinks", async (request, reply) => {
		return reply.code(200).send(getAllPeerLinks({ requestPeerCondition: request.peerCondition(PeerAccess.ReadLink) }));
	});

	fastify.get("/api/tags", async (request, reply) => {
		// FIXME: should access to some tags be restricted?
		return reply.code(200).send(getAllTags());
	});
});
