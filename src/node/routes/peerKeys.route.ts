import type { KeyObject } from "crypto";
import fastifyPlugin from "fastify-plugin";
import type { DBPeerKey, DBPeerLinkKey, StringifiedBinary } from "../database/types";
import { dbPeerKeySchema, dbPeerLinkKeySchema, dbPeerSchema } from "../database/types";
import { derivePublicKey, extractKey, generateKeys, parsePrivateKey, parsePublicKey } from "../keys";

export default fastifyPlugin(async (fastify) => {
	const { setPeerKeys, getPeerPrivateKey, getPeerLinkPresharedKey } = fastify.database.requests;

	fastify.get<{
		Params: StringifiedBinary<DBPeerKey>;
	}>(
		"/api/peers/:id/privateKey",
		{
			schema: {
				params: dbPeerKeySchema,
			},
		},
		async (request, reply) => reply.status(200).send(getPeerPrivateKey(request.params)),
	);

	fastify.post<{
		Params: StringifiedBinary<DBPeerKey>;
		Body: { privateKey?: string };
	}>(
		"/api/peers/:id/privateKey",
		{
			schema: {
				params: dbPeerKeySchema,
				body: { privateKey: dbPeerSchema.privateKey },
			},
		},
		async (request, reply) => {
			const { privateKey: strPrivateKey } = request.body;
			let privateKey: KeyObject;
			let publicKey: KeyObject;
			if (strPrivateKey) {
				privateKey = parsePrivateKey(strPrivateKey);
				publicKey = derivePublicKey(privateKey);
			} else {
				({ privateKey, publicKey } = await generateKeys());
			}
			setPeerKeys({
				...request.params,
				publicKey: extractKey(publicKey),
				privateKey: extractKey(privateKey),
			});
			return reply.status(204).send();
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerKey>;
		Body: { publicKey?: string };
	}>(
		"/api/peers/:id/publicKey",
		{
			schema: {
				params: dbPeerKeySchema,
				body: { publicKey: dbPeerSchema.publicKey },
			},
		},
		async (request, reply) => {
			const { publicKey: strPublicKey } = request.body;
			setPeerKeys({
				...request.params,
				publicKey: strPublicKey ? extractKey(parsePublicKey(strPublicKey)) : null,
				privateKey: null,
			});
			return reply.status(204).send();
		},
	);

	fastify.get<{
		Params: StringifiedBinary<DBPeerLinkKey>;
	}>(
		"/api/peerLinks/:peer1-:peer2/presharedKey",
		{
			schema: {
				params: dbPeerLinkKeySchema,
			},
		},
		async (request, reply) => reply.status(200).send(getPeerLinkPresharedKey(request.params)),
	);
});
