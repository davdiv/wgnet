import type { KeyObject } from "crypto";
import fastifyPlugin from "fastify-plugin";
import type { AcceptStringifiedBinary, DBNewPeer, DBNewTag, DBPeer, DBPeerKey, DBTag, DBTagKey, StringifiedBinary } from "../database/types";
import { dbPeerKeySchema, dbPeerNonKeyNonSecSchema, dbPeerNonKeySchema, dbTagKeySchema, dbTagNonKeySchema } from "../database/types";
import { derivePublicKey, extractKey, generateKeys, parsePrivateKey, parsePublicKey } from "../keys";

export default fastifyPlugin(async (fastify) => {
	const { addPeer, addTag, updateTag, updatePeer, deletePeer, deleteTag } = fastify.database.requests;

	fastify.post<{
		Body: StringifiedBinary<DBNewPeer>;
	}>(
		"/api/peers",
		{
			schema: {
				body: dbPeerNonKeySchema,
			},
		},
		async (request, reply) => {
			const body: AcceptStringifiedBinary<DBNewPeer> = { ...request.body };
			if (body.privateKey != null) {
				let privateKey: KeyObject;
				let publicKey: KeyObject;
				if (body.privateKey === "generate") {
					({ privateKey, publicKey } = await generateKeys());
				} else {
					privateKey = parsePrivateKey(body.privateKey);
					publicKey = derivePublicKey(privateKey);
				}
				body.privateKey = extractKey(privateKey);
				body.publicKey = extractKey(publicKey);
			} else if (body.publicKey != null) {
				body.publicKey = extractKey(parsePublicKey(body.publicKey));
			}
			const id = addPeer(body);
			return reply.code(200).send({ id });
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerKey>;
		Body: Pick<StringifiedBinary<DBPeer>, keyof typeof dbPeerNonKeyNonSecSchema>;
	}>(
		"/api/peers/:id",
		{
			schema: {
				params: dbPeerKeySchema,
				body: dbPeerNonKeyNonSecSchema,
			},
		},
		async (request, reply) => {
			updatePeer({ ...request.body, ...request.params });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerKey>;
	}>(
		"/api/peers/:id",
		{
			schema: { params: dbPeerKeySchema },
		},
		async (request, reply) => {
			deletePeer(request.params);
			return reply.code(204).send();
		},
	);

	fastify.post<{
		Body: StringifiedBinary<DBNewTag>;
	}>(
		"/api/tags",
		{
			schema: {
				body: dbTagNonKeySchema,
			},
		},
		async (request, reply) => {
			const id = addTag(request.body);
			return reply.code(200).send({ id });
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBTagKey>;
		Body: Omit<StringifiedBinary<DBTag>, keyof DBTagKey>;
	}>(
		"/api/tags/:id",
		{
			schema: {
				params: dbTagKeySchema,
				body: dbTagNonKeySchema,
			},
		},
		async (request, reply) => {
			updateTag({ ...request.body, ...request.params });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBTagKey>;
	}>(
		"/api/tags/:id",
		{
			schema: { params: dbTagKeySchema },
		},
		async (request, reply) => {
			deleteTag(request.params);
			return reply.code(204).send();
		},
	);
});
