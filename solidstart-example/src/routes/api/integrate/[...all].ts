import { toSolidStartHandler } from "integrate-sdk/server";
import { handler } from "~/lib/integrate-server";

const handlers = toSolidStartHandler(handler);

export const { GET, POST, PATCH, PUT, DELETE } = handlers;