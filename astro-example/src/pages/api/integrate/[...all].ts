import { serverClient } from '@/lib/integrate-server';
import type { APIRoute } from 'astro';

export const ALL: APIRoute = async (ctx) => {
    return serverClient.handler(ctx.request);
};