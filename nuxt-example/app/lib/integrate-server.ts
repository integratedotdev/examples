import { createMCPServer, githubPlugin } from 'integrate-sdk/server';

export const { client: serverClient, handler } = createMCPServer({
    apiKey: import.meta.env.INTEGRATE_API_KEY,
    plugins: [
        githubPlugin({
            clientId: import.meta.env.GITHUB_CLIENT_ID,
            clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
            scopes: ['repo', 'user'],
        }),
    ],
});