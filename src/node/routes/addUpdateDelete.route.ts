import type { KeyObject } from "crypto";
import fastifyPlugin from "fastify-plugin";
import { PeerAccess } from "../../common/peerConditions/accessRights";
import { matchPeerCondition } from "../../common/peerConditions/evaluate";
import type { AcceptStringifiedBinary, DBNewPeer, DBNewPeerExposed, DBNewTag, DBPeer, DBPeerExposed, DBPeerKey, DBTag, DBTagKey, StringifiedBinary } from "../database/types";
import { dbPeerKeySchema, dbPeerNonKeyNonSecSchema, dbPeerNonKeySchema, dbTagKeySchema, dbTagNonKeySchema } from "../database/types";
import { derivePublicKey, extractKey, generateKeys, parsePrivateKey, parsePublicKey } from "../keys";
import { accessForbidden } from "./authentication";

export default fastifyPlugin(async (fastify) => {
	const { addPeer, setPeerTags, addTag, updateTag, updatePeer, deletePeer, deleteTag } = fastify.database.requests;

	const processTags = (tags: number[] | null): string | null => {
		const tagsSet = new Set(tags ?? []);
		return tagsSet.size > 0 ? JSON.stringify([...tagsSet]) : null;
	};

	fastify.post<{
		Body: StringifiedBinary<DBNewPeerExposed>;
	}>(
		"/api/peers",
		{
			schema: {
				body: dbPeerNonKeySchema,
			},
		},
		async (request, reply) => {
			const peerCondition = request.peerCondition(PeerAccess.CreateDelete);
			const body: AcceptStringifiedBinary<DBNewPeer> = { ...request.body, tags: processTags(request.body.tags) };
			if (!matchPeerCondition(peerCondition, body.tags, -1)) {
				return accessForbidden(reply);
			}
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
			updatePeer({ ...request.body, ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
			return reply.code(204).send();
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerKey>;
		Body: Pick<DBPeerExposed, "tags">;
	}>(
		"/api/peers/:id/tags",
		{
			schema: {
				params: dbPeerKeySchema,
				body: { tags: dbPeerNonKeySchema.tags },
			},
		},
		async (request, reply) => {
			setPeerTags({
				...request.params,
				tags: processTags(request.body.tags),
				requestPeerCondition: request.peerCondition(PeerAccess.WriteTags),
			});
			return reply.status(204).send();
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
			deletePeer({ ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.CreateDelete) });
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
			if (!request.user.wgnet?.tagsAdmin) {
				return accessForbidden(reply);
			}
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
			if (!request.user.wgnet?.tagsAdmin) {
				return accessForbidden(reply);
			}
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
			if (!request.user.wgnet?.tagsAdmin) {
				return accessForbidden(reply);
			}
			deleteTag(request.params);
			return reply.code(204).send();
		},
	);
});
