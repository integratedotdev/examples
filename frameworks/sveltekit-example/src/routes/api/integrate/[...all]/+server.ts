import { toSvelteKitHandler } from 'integrate-sdk/server';
import { serverClient } from '$lib/integrate';

const svelteKitHandler = toSvelteKitHandler(serverClient);

export const POST = svelteKitHandler;
export const GET = svelteKitHandler;