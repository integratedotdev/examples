import { createMCPServer, githubIntegration } from 'integrate-sdk/server';
import { INTEGRATE_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const { client: serverClient } = createMCPServer({
    apiKey: INTEGRATE_API_KEY,
    integrations: [
        githubIntegration({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            scopes: ['repo', 'user'],
        }),
    ],
});