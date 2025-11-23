import express from "express";
import {
    createMCPServer,
    githubIntegration,
} from "integrate-sdk/server";
import cors from "cors";

const app = express();

export const { client: serverClient } = createMCPServer({
    integrations: [
        githubIntegration({
            scopes: ["repo", "user"],
        }),
    ],
});

app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
)

app.all("/api/integrate/*", (request: Request) => {
    return serverClient.handler(request);
});

app.use(express.json());

app.listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});