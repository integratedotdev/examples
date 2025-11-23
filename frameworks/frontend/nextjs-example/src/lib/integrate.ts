import { createMCPServer, githubIntegration } from 'integrate-sdk/server';

// Create server instance with API key and integrations
// This must be called server-side only (not in browser/client code)
export const { client: serverClient } = createMCPServer({
  // Use environment variables WITHOUT NEXT_PUBLIC_ prefix
  apiKey: process.env.INTEGRATE_API_KEY,
  integrations: [
    githubIntegration({
      scopes: ['repo', 'user'],
    }),
  ],
});