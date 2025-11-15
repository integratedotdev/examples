import { createMCPServer, githubPlugin } from 'integrate-sdk/server';

export const { client: serverClient } = createMCPServer({
    apiKey: process.env.INTEGRATE_API_KEY,
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});