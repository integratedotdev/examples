import { serverClient } from "@/lib/integrate";
import {
    getAnthropicTools,
} from "integrate-sdk/server";
import Anthropic from "@anthropic-ai/sdk";
import { handleAnthropicMessage } from "integrate-sdk/ai/anthropic";

const anthropic = new Anthropic();

export async function POST(req: Request) {
    const { messages } = await req.json();

    const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        messages,
        tools: await getAnthropicTools(serverClient),
        max_tokens: 1000,
    });

    const result = await handleAnthropicMessage(serverClient, msg);

    return Response.json(result);
}