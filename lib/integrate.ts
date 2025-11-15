// @ts-ignore this is to copy to examples
import { createMCPClient, githubPlugin } from 'integrate-sdk';

export const client = createMCPClient({
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});