import { toSvelteKitHandler } from 'integrate-sdk/server';
import { handler } from '$lib/integrate-server';

const svelteKitHandler = toSvelteKitHandler(handler);

export const POST = svelteKitHandler;
export const GET = svelteKitHandler;