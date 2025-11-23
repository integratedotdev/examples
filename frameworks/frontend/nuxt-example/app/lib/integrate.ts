import { createMCPServer, githubIntegration } from 'integrate-sdk/server';

export const { client: serverClient } = createMCPServer({
    apiKey: import.meta.env.INTEGRATE_API_KEY,
    integrations: [
        githubIntegration({
            scopes: ['repo', 'user'],
        }),
    ],
});