import { createFileRoute } from '@tanstack/react-router';
import { serverClient } from '@/lib/integrate';

export const Route = createFileRoute('/api/integrate/$')({
    server: {
        handlers: {
            GET: ({ request }) => {
                return serverClient.handler(request)
            },
            POST: ({ request }) => {
                return serverClient.handler(request)
            },
        },
    },
});