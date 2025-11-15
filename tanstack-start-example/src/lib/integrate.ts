// @ts-ignore this is to copy to examples
import { createMCPClient, githubPlugin } from 'integrate-sdk';

// Mock process for browser environment
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