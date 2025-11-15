// @ts-ignore this is to copy to examples
import { createMCPServer, githubPlugin } from 'integrate-sdk/server';

export const { client: serverClient, handler } = createMCPServer({
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});