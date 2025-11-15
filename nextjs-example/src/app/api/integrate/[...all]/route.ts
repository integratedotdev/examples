import { serverClient } from '@/lib/integrate-server';
import { toNextJsHandler } from 'integrate-sdk/server';

export const { POST, GET } = toNextJsHandler(serverClient);