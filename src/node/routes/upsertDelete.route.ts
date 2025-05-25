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
	jsonSchema,
} from "../database/types";
import { generate32BytesKey } from "../keys";
import { PeerAccess } from "../../common/peerConditions/accessRights";

export default fastifyPlugin(async (fastify) => {
	const { deletePeerAllowedIp, deletePeerEndpoint, deletePeerIp, deletePeerLink, upsertPeerAllowedIp, upsertPeerEndpoint, upsertPeerIp, upsertPeerLink } = fastify.database.requests;

	fastify.put<{
		Params: StringifiedBinary<DBPeerAllowedIpKey>;
		Body: Omit<StringifiedBinary<DBPeerAllowedIp>, keyof DBPeerAllowedIpKey>;
	}>(
		"/api/peers/:peer/allowedIPs/:ip/:netmask",
		{
			schema: {
				params: jsonSchema(dbPeerAllowedIpKeySchema),
				body: jsonSchema(dbPeerAllowedIpNonKeySchema),
			},
		},
		async (request, reply) => {
			upsertPeerAllowedIp({ ...request.body, ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerAllowedIpKey>;
	}>(
		"/api/peers/:peer/allowedIPs/:ip/:netmask",
		{
			schema: { params: jsonSchema(dbPeerAllowedIpKeySchema) },
		},
		async (request, reply) => {
			deletePeerAllowedIp({ ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
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
				params: jsonSchema(dbPeerEndpointKeySchema),
				body: jsonSchema(dbPeerEndpointNonKeySchema),
			},
		},
		async (request, reply) => {
			upsertPeerEndpoint({ ...request.body, ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerEndpointKey>;
	}>(
		"/api/peers/:peer/endpoints/:endpoint",
		{
			schema: { params: jsonSchema(dbPeerEndpointKeySchema) },
		},
		async (request, reply) => {
			deletePeerEndpoint({ ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
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
				params: jsonSchema(dbPeerIpKeySchema),
				body: jsonSchema(dbPeerIpNonKeySchema),
			},
		},
		async (request, reply) => {
			upsertPeerIp({ ...request.body, ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
			return reply.code(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerIpKey>;
	}>(
		"/api/peers/:peer/ips/:ip",
		{
			schema: { params: jsonSchema(dbPeerIpKeySchema) },
		},
		async (request, reply) => {
			deletePeerIp({ ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteOwnConfig) });
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
				params: jsonSchema(dbPeerLinkKeySchema),
				body: jsonSchema(dbPeerLinkNonKeySchema),
			},
		},
		async (request, reply) => {
			const item: AcceptStringifiedBinary<DBPeerLink> = { ...request.body, ...request.params };
			if (item.presharedKey === "generate") {
				item.presharedKey = generate32BytesKey();
			}
			upsertPeerLink({ ...item, requestPeerCondition: request.peerCondition(PeerAccess.WriteLink) });
			return reply.status(204).send();
		},
	);

	fastify.delete<{
		Params: StringifiedBinary<DBPeerLinkKey>;
	}>(
		"/api/peerLinks/:peer1-:peer2",
		{
			schema: { params: jsonSchema(dbPeerLinkKeySchema) },
		},
		async (request, reply) => {
			deletePeerLink({ ...request.params, requestPeerCondition: request.peerCondition(PeerAccess.WriteLink) });
			return reply.status(204).send();
		},
	);
});
