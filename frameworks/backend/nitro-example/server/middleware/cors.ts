import { defineEventHandler, setHeaders } from "h3";

export default defineEventHandler((event) => {
    // Set CORS headers
    setHeaders(event, {
        "Access-Control-Allow-Origin": "http://localhost:3000",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
    });

    // Handle preflight requests
    if (event.node.req.method === "OPTIONS") {
        return new Response(null, { status: 204 });
    }
});

