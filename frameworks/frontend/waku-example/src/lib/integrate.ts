import { createMCPServer, githubIntegration } from 'integrate-sdk/server';
import { getEnv } from 'waku';

export const { client: serverClient } = createMCPServer({
    apiKey: getEnv('INTEGRATE_API_KEY')!,
    integrations: [
        githubIntegration({
            clientId: getEnv('GITHUB_CLIENT_ID')!,
            clientSecret: getEnv('GITHUB_CLIENT_SECRET')!,
            scopes: ['repo', 'user'],
        }),
    ],
});