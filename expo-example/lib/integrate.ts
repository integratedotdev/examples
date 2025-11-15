import { createMCPClient, githubPlugin } from 'integrate-sdk';

if (typeof window !== 'undefined') {
    if (typeof process === 'undefined') {
        (globalThis as any).process = { env: {}, on: () => { } };
    } else if (typeof process.on !== 'function') {
        (process as any).on = () => { };
    }
}

export const client = createMCPClient({
    plugins: [
        githubPlugin({
            scopes: ['repo', 'user'],
        }),
    ],
});