import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (fastify) => {
	const { getAllPeers, getAllPeerLinks, getAllTags } = fastify.database.requests;

	fastify.get("/api/peers", async (request, reply) => {
		return reply.code(200).send(getAllPeers());
	});

	fastify.get("/api/peerLinks", async (request, reply) => {
		return reply.code(200).send(getAllPeerLinks());
	});

	fastify.get("/api/tags", async (request, reply) => {
		return reply.code(200).send(getAllTags());
	});
});
