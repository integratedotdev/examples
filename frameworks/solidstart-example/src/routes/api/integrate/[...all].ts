import { toSolidStartHandler } from "integrate-sdk/server";
import { serverClient } from "~/lib/integrate-server";

const handlers = toSolidStartHandler(serverClient)

export const { GET, POST, PATCH, PUT, DELETE } = handlers;