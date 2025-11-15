import { serverClient } from "~/lib/integrate-server";

export default defineEventHandler((event) => {
    return serverClient.handler(toWebRequest(event));
});