import { createMCPServer, githubIntegration } from 'integrate-sdk/server';

export const { client: serverClient } = createMCPServer({
    apiKey: import.meta.env.INTEGRATE_API_KEY,
    integrations: [
        githubIntegration({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
            scopes: ['repo', 'user'],
        }),
    ],
});