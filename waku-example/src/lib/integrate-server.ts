import { createMCPServer, githubPlugin } from 'integrate-sdk/server';
import { getEnv } from 'waku';

export const { client: serverClient } = createMCPServer({
    apiKey: getEnv('INTEGRATE_API_KEY')!,
    plugins: [
        githubPlugin({
            clientId: getEnv('GITHUB_CLIENT_ID')!,
            clientSecret: getEnv('GITHUB_CLIENT_SECRET')!,
            scopes: ['repo', 'user'],
        }),
    ],
});