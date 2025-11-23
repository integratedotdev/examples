import { defineEventHandler } from "h3"

import {
  createMCPServer,
  githubIntegration,
} from "integrate-sdk/server";

export const { client: serverClient } = createMCPServer({
  apiKey: process.env.INTEGRATE_API_KEY,
  integrations: [
    githubIntegration({
      scopes: ["repo", "user"],
    }),
  ],
});

export default defineEventHandler(async (event) => {
  return serverClient.handler(event.node.req);
});