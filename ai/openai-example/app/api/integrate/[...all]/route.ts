import { serverClient } from '@/lib/integrate';
import { toNextJsHandler } from 'integrate-sdk/server';

export const { POST, GET } = toNextJsHandler(serverClient);