import fastifyPlugin from "fastify-plugin";
import type {
	AcceptStringifiedBinary,
	DBPeerAllowedIp,
	DBPeerAllowedIpKey,
	DBPeerEndpoint,
	DBPeerEndpointKey,
	DBPeerIp,
	DBPeerIpKey,
	DBPeerLink,
	DBPeerLinkKey,
	DBPeerTag,
	DBPeerTagKey,
	StringifiedBinary,
} from "../database/types";
import {
	dbPeerAllowedIpKeySchema,
	dbPeerAllowedIpNonKeySchema,
	dbPeerEndpointKeySchema,
	dbPeerEndpointNonKeySchema,
	dbPeerIpKeySchema,
	dbPeerIpNonKeySchema,
	dbPeerLinkKeySchema,
	dbPeerLinkNonKeySchema,
	dbPeerTagKeySchema,
	dbPeerTagNonKeySchema,
} from "../database/types";
import { generate32BytesKey } from "../keys";

export default fastifyPlugin(async (fastify) => {
	const { deletePeerAllowedIp, deletePeerEndpoint, deletePeerIp, deletePeerLink, deletePeerTag, upsertPeerAllowedIp, upsertPeerEndpoint, upsertPeerIp, upsertPeerLink, upsertPeerTag } =
		fastify.database.requests;

	fastify.put<{
		Params: StringifiedBinary<DBPeerAllowedIpKey>;
		Body: Omit<StringifiedBinary<DBPeerAllowedIp>, keyof DBPeerAllowedIpKey>;
	}>(
		"/api/peers/:peer/allowedIPs/:ip/:netmask",
		{
			schema: {
				params: dbPeerAllowedIpKeySchema,
				body: dbPeerAllowedIpNonKeySchema,
			},
		},
		async (request, reply) => {
			upsertPeerAllowedIp({ ...request.body, ...request.params });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerAllowedIpKey>;
	}>(
		"/api/peers/:peer/allowedIPs/:ip/:netmask",
		{
			schema: { params: dbPeerAllowedIpKeySchema },
		},
		async (request, reply) => {
			deletePeerAllowedIp(request.params);
			return reply.code(204).send();
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerEndpointKey>;
		Body: Omit<StringifiedBinary<DBPeerEndpoint>, keyof DBPeerEndpointKey>;
	}>(
		"/api/peers/:peer/endpoints/:endpoint",
		{
			schema: {
				params: dbPeerEndpointKeySchema,
				body: dbPeerEndpointNonKeySchema,
			},
		},
		async (request, reply) => {
			upsertPeerEndpoint({ ...request.body, ...request.params });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerEndpointKey>;
	}>(
		"/api/peers/:peer/endpoints/:endpoint",
		{
			schema: { params: dbPeerEndpointKeySchema },
		},
		async (request, reply) => {
			deletePeerEndpoint(request.params);
			return reply.code(204).send();
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerIpKey>;
		Body: Omit<StringifiedBinary<DBPeerIp>, keyof DBPeerIpKey>;
	}>(
		"/api/peers/:peer/ips/:ip",
		{
			schema: {
				params: dbPeerIpKeySchema,
				body: dbPeerIpNonKeySchema,
			},
		},
		async (request, reply) => {
			upsertPeerIp({ ...request.body, ...request.params });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerIpKey>;
	}>(
		"/api/peers/:peer/ips/:ip",
		{
			schema: { params: dbPeerIpKeySchema },
		},
		async (request, reply) => {
			deletePeerIp(request.params);
			return reply.code(204).send();
		},
	);

	fastify.put<{
		Params: StringifiedBinary<DBPeerTagKey>;
		Body: Omit<StringifiedBinary<DBPeerTag>, keyof DBPeerTagKey>;
	}>(
		"/api/peers/:peer/tags/:tag",
		{
			schema: {
				params: dbPeerTagKeySchema,
				body: dbPeerTagNonKeySchema,
			},
		},
		async (request, reply) => {
			upsertPeerTag(request.params);
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerTagKey>;
	}>(
		"/api/peers/:peer/tags/:tag",
		{
			schema: { params: dbPeerTagKeySchema },
		},
		async (request, reply) => {
			deletePeerTag(request.params);
			return reply.code(204).send();
		},
	);

	fastify.post<{
		Params: StringifiedBinary<DBPeerLinkKey>;
		Body: Omit<StringifiedBinary<DBPeerLink>, keyof DBPeerLinkKey>;
	}>(
		"/api/peerLinks/:peer1-:peer2",
		{
			schema: {
				params: dbPeerLinkKeySchema,
				body: dbPeerLinkNonKeySchema,
			},
		},
		async (request, reply) => {
			const item: AcceptStringifiedBinary<DBPeerLink> = { ...request.body, ...request.params };
			if (item.presharedKey === "generate") {
				item.presharedKey = generate32BytesKey();
			}
			upsertPeerLink(item);
			return reply.status(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerLinkKey>;
	}>(
		"/api/peerLinks/:peer1-:peer2",
		{
			schema: { params: dbPeerLinkKeySchema },
		},
		async (request, reply) => {
			deletePeerLink(request.params);
			return reply.status(204).send();
		},
	);
});
