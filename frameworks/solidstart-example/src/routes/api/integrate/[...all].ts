import { toSolidStartHandler } from "integrate-sdk/server";
import { serverClient } from "~/lib/integrate";

const handlers = toSolidStartHandler(serverClient)

export const { GET, POST, PATCH, PUT, DELETE } = handlers;