import fastifyPlugin from "fastify-plugin";

export default fastifyPlugin(async (fastify) => {
	fastify.get("/login/*", async (request, reply) => await reply.redirect("/"));
	fastify.get(
		"/logout",
		async (request, reply) =>
			await reply
				.setCookie("auth", "", {
					expires: new Date(0),
				})
				.status(200)
				.type("text/plain")
				.send("Logged out successfully!"),
	);
	fastify.addHook("onRequest", async (request, reply) => {
		const auth = request.url.startsWith("/login/") ? request.url.slice(7) : null;
		let newCookie = false;
		try {
			if (auth) {
				fastify.jwt.verify(auth);
				newCookie = true;
			} else {
				await request.jwtVerify();
				newCookie = (request.user as any).exp * 1000 - Date.now() < 1000 * 60 * 5;
			}
		} catch (error) {
			return reply.status(403).type("text/plain").send("Access forbidden");
		}
		if (newCookie) {
			const cookie = fastify.jwt.sign({});
			reply.setCookie("auth", cookie, {
				sameSite: "strict",
				path: "/",
				httpOnly: true,
				secure: true,
			});
		}
	});
});
