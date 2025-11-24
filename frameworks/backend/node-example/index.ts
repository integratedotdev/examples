import { createServer } from "http";
import { createMCPServer, githubIntegration } from "integrate-sdk/server";

const { client: serverClient } = createMCPServer({
    apiKey: process.env.INTEGRATE_API_KEY,
    integrations: [
        githubIntegration({
            scopes: ["repo", "user"],
        }),
    ],
});

createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "http://localhost:3000");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    if (req.method === "OPTIONS") {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.url?.startsWith("/api/integrate/")) {
        await serverClient.handler(req);
    } else {
        res.statusCode = 404;
        res.end("Not Found");
    }
}).listen(process.env.PORT || 8080, () => {
    console.log(`Server running on port ${process.env.PORT || 8080}`);
});