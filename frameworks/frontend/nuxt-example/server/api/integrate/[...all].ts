import { serverClient } from "~/lib/integrate";

export default defineEventHandler((event) => {
    return serverClient.handler(toWebRequest(event));
});