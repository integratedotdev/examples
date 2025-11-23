import { Elysia } from "elysia";
import { createMCPServer, githubIntegration } from "integrate-sdk/server";
import { cors } from "@elysiajs/cors";

const app = new Elysia();

const { client: serverClient } = createMCPServer({
  apiKey: process.env.INTEGRATE_API_KEY,
  integrations: [
    githubIntegration({
      scopes: ["repo", "user"],
    }),
  ],
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.all("/api/integrate/*", (context) => {
  return serverClient.handler(context.request);
});

app.listen(process.env.PORT || 8080);
console.log(`Server running on port ${process.env.PORT || 8080}`);