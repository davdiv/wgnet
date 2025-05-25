import fastifyJwt from "@fastify/jwt";
import type { FastifyReply, FastifyRequest } from "fastify";
import fastifyJwtJwks from "fastify-jwt-jwks";
import fastifyPlugin from "fastify-plugin";
import { formatBase64 } from "../../common/keys";
import { type PeerAccessRight, type PeerAccess, getPeerCondition, reduceRights, fullPeerReadAccess } from "../../common/peerConditions/accessRights";
import { generate32BytesKey } from "../keys";
import { jsonSchema } from "../database/types";

export interface UserInfo {
	exp?: number;
	iat?: number;
	wgnet?: {
		tagsAdmin?: boolean;
		peerAccess?: PeerAccessRight[];
		peerDefaultTags?: number[];
	};
}

declare module "fastify" {
	interface FastifyRequest {
		peerCondition: (requestedAccess: PeerAccess) => string;
	}
}

declare module "@fastify/jwt" {
	interface FastifyJWT {
		payload: UserInfo;
	}
}

export interface OIDCConfig {
	authority: string;
	client_id: string;
	client_secret: string;
}

export type AuthenticationConfig =
	| {
			type: "oidc";
			publicUrl?: string;
			oidc: OIDCConfig;
	  }
	| {
			type: "basic";
			jwtKey: Buffer;
	  };

export const accessForbidden = (reply: FastifyReply) => reply.status(403).type("text/plain").send("Access forbidden");

export default fastifyPlugin(async (fastify, authConfig: AuthenticationConfig) => {
	fastify.get("/api/user", async (request, reply) => {
		let { peerAccess, tagsAdmin, ...wgnet } = request.user.wgnet ?? {};
		if (fastify.database.readonly) {
			peerAccess = reduceRights(fullPeerReadAccess, peerAccess);
			tagsAdmin = false;
		}
		return reply.code(200).send({ wgnet: { ...wgnet, tagsAdmin, peerAccess } });
	});
	fastify.decorateRequest("peerCondition", function (requestedAccess) {
		return JSON.stringify(getPeerCondition(requestedAccess, this.user.wgnet?.peerAccess));
	});

	if (authConfig.type === "oidc") {
		const {
			publicUrl,
			oidc: { authority, client_id, client_secret },
		} = authConfig;
		const oidcMetadataReq = await fetch(`${authority}/.well-known/openid-configuration`);
		const oidcMetadata = oidcMetadataReq.ok ? await oidcMetadataReq.json() : null;
		const authFormHeaders = {
			"Content-Type": "application/x-www-form-urlencoded",
			Authorization: `Basic ${Buffer.from(`${client_id}:${client_secret}`).toString("base64")}`,
		};
		if (!oidcMetadata || typeof oidcMetadata !== "object" || oidcMetadata.issuer !== authority || typeof oidcMetadata.jwks_uri !== "string") {
			throw new Error("Invalid OIDC server!");
		}
		const { jwks_uri, end_session_endpoint } = oidcMetadata;
		const loginURL = publicUrl ? new URL("/login/", publicUrl).href : null;
		const redirectUri = loginURL ? () => loginURL : (request: FastifyRequest) => new URL("/login/", `${request.protocol}://${request.host}`).href;
		fastify.register(fastifyJwtJwks, {
			jwksUrl: jwks_uri,
			audience: client_id,
			issuer: authority,
			cookie: {
				cookieName: "auth",
				signed: false,
			},
		});
		const fetchToken = async (request: FastifyRequest, reply: FastifyReply, body: string) => {
			const res = await fetch(oidcMetadata.token_endpoint, {
				method: "POST",
				headers: authFormHeaders,
				body,
			});
			if (!res.ok) {
				throw new Error(`Error while fetching token: ${res.status} ${await res.text()}`);
			}
			const json = await res.json();
			request.user = fastify.jwt.decode(json.access_token)!;
			if (json.refresh_token) {
				reply.setCookie("auth_refresh", json.refresh_token, {
					sameSite: "lax",
					path: "/",
					httpOnly: true,
					secure: true,
				});
			}
			reply.setCookie("auth", json.access_token, {
				sameSite: "lax",
				path: "/",
				httpOnly: true,
				secure: true,
			});
		};
		const logout = async (request: FastifyRequest, reply: FastifyReply) =>
			await reply.clearCookie("auth", { path: "/" }).clearCookie("auth_refresh", { path: "/" }).clearCookie("state", { path: "/login/" }).redirect(end_session_endpoint);
		fastify.get("/logout", logout);
		fastify.get<{ Querystring: { state?: string; iss?: string; code?: string } }>(
			"/login/",
			{
				schema: {
					querystring: jsonSchema({
						state: { type: "string" },
						iss: { type: "string" },
						code: { type: "string" },
					}),
				},
			},
			async (request, reply) => {
				if (request.user) {
					return reply.redirect("/");
				}
				const { state, iss, code } = request.query;
				if (state && iss && code && request.cookies.state === state) {
					try {
						await fetchToken(request, reply, `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri(request))}`);
						return reply.clearCookie("state", { path: "/login/" }).redirect("/");
					} catch (error) {
						request.log.error(error);
						return logout(request, reply);
					}
				} else if (!iss) {
					const state = formatBase64(generate32BytesKey());
					return reply
						.setCookie("state", state, {
							sameSite: "lax",
							path: "/login/",
							httpOnly: true,
							secure: true,
						})
						.redirect(
							new URL(
								`?scope=openid&response_type=code&state=${encodeURIComponent(state)}&client_id=${encodeURIComponent(client_id)}&redirect_uri=${encodeURIComponent(redirectUri(request))}`,
								oidcMetadata.authorization_endpoint,
							).href,
						);
				}
				return accessForbidden(reply);
			},
		);
		fastify.addHook("onRequest", async (request, reply) => {
			try {
				try {
					await request.jwtVerify();
				} catch (error: any) {
					const refreshToken = request.cookies.auth_refresh;
					if (error.code !== "FST_JWT_AUTHORIZATION_TOKEN_EXPIRED" || !refreshToken) {
						throw error;
					}
					await fetchToken(request, reply, `grant_type=refresh_token&refresh_token=${encodeURIComponent(refreshToken)}`);
				}
			} catch {
				if (new URL(request.url, "http://localhost").pathname === "/login/") {
					return;
				}
				return accessForbidden(reply);
			}
		});
	} else {
		const algorithm = "HS256";
		const { jwtKey } = authConfig;
		fastify.register(fastifyJwt, {
			cookie: {
				cookieName: "auth",
				signed: false,
			},
			secret: jwtKey,
			sign: {
				algorithm,
				expiresIn: "10m",
			},
			verify: {
				algorithms: [algorithm],
			},
		});
		fastify.get("/login/*", async (request, reply) => await reply.redirect("/"));
		fastify.get("/logout", async (request, reply) => await reply.clearCookie("auth", { path: "/" }).status(200).type("text/plain").send("Logged out successfully!"));
		fastify.addHook("onRequest", async (request, reply) => {
			const auth = request.url.startsWith("/login/") ? request.url.slice(7) : null;
			let newCookie = false;
			try {
				if (auth) {
					request.user = fastify.jwt.verify(auth);
					newCookie = true;
				} else {
					await request.jwtVerify();
					newCookie = request.user.exp! * 1000 - Date.now() < 1000 * 60 * 5;
				}
			} catch {
				return accessForbidden(reply);
			}
			if (newCookie) {
				const payload = { ...request.user };
				delete payload.exp;
				delete payload.iat;
				const cookie = fastify.jwt.sign(payload);
				reply.setCookie("auth", cookie, {
					sameSite: "lax",
					path: "/",
					httpOnly: true,
					secure: true,
				});
			}
		});
	}
});
