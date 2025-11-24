import Fastify from "fastify";
import cors from "@fastify/cors";
import {
    createMCPServer,
    githubIntegration,
} from "integrate-sdk/server";

const app = Fastify();

export const { client: serverClient } = createMCPServer({
    apiKey: process.env.INTEGRATE_API_KEY,
    integrations: [
        githubIntegration({
            scopes: ["repo", "user"],
        }),
    ],
});

await app.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
});

app.route({
    method: ["GET", "POST"],
    url: "/api/integrate/*",
    async handler(request, reply) {
        try {
            const url = new URL(request.url, `http://${request.headers.host}`);

            const headers = new Headers();
            Object.entries(request.headers).forEach(([key, value]) => {
                if (value) headers.append(key, value.toString());
            });

            const req = new Request(url.toString(), {
                method: request.method,
                headers,
                body: request.body ? JSON.stringify(request.body) : undefined,
            });

            const response = await serverClient.handler(req);

            if (response) {
                reply.status(response.status);
                response.headers.forEach((value: string, key: string) => reply.header(key, value));
                reply.send(response.body ? await response.text() : null);
            } else {
                reply.status(204).send();
            }
        } catch (error) {
            reply.status(500).send({
                error: "Internal integration error",
                code: "INTEGRATION_FAILURE"
            });
        }
    }
});

app.listen({ port: Number(process.env.PORT) || 8080 }, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});