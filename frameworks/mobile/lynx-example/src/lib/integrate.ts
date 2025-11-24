import { createMCPClient, githubIntegration } from "integrate-sdk";

export const mcpClient = createMCPClient({
    apiBaseUrl: "http://localhost:8080",
    integrations: [
        githubIntegration({
            scopes: ["repo", "user"],
        }),
    ],
});