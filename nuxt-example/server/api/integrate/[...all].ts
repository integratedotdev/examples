import { handler } from "~/lib/integrate-server";

export default defineEventHandler((event) => {
    return handler(toWebRequest(event));
});