import { createMCPClient, githubIntegration } from "integrate-sdk";

export const client = createMCPClient({
    apiBaseUrl: "http://localhost:8080",
    integrations: [
        githubIntegration({
            scopes: ["repo", "user"],
        }),
    ],
});