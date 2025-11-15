import { createFileRoute } from '@tanstack/react-router';
import { handler } from '@/lib/integrate-server';

export const Route = createFileRoute('/api/integrate/$')({
    server: {
        handlers: {
            GET: ({ request }) => {
                return handler(request)
            },
            POST: ({ request }) => {
                return handler(request)
            },
        },
    },
});