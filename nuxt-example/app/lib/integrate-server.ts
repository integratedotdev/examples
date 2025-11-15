import { createMCPServer, githubPlugin } from 'integrate-sdk/server';

export const { client: serverClient, handler } = createMCPServer({
    apiKey: import.meta.env.INTEGRATE_API_KEY,
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});