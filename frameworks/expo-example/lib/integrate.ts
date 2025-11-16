import { createMCPClient, githubIntegration } from 'integrate-sdk';

export const client = createMCPClient({
    integrations: [
        githubIntegration({
            scopes: ['repo', 'user'],
        }),
    ],
});