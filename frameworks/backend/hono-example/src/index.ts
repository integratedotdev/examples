import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { createMCPServer, githubIntegration } from 'integrate-sdk/server';

const app = new Hono()

export const { client: serverClient } = createMCPServer({
  apiKey: process.env.INTEGRATE_API_KEY,
  integrations: [
    githubIntegration({
      scopes: ["repo", "user"],
    }),
  ],
});

app.use(
  "/api/integrate/*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/integrate/*", (c) => {
  return serverClient.handler(c.req.raw);
});

export default app
