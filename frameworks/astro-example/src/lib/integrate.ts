import { createMCPClient, githubPlugin } from 'integrate-sdk';

export const client = createMCPClient({
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});