import { createMCPServer, githubPlugin } from 'integrate-sdk/server';
import { INTEGRATE_API_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

export const { client: serverClient, handler } = createMCPServer({
    apiKey: INTEGRATE_API_KEY,
    plugins: [
        githubPlugin({
            clientId: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            scopes: ['repo', 'user'],
        }),
    ],
});