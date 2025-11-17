import { serverClient } from "@/lib/integrate";
import { getVercelAITools } from "integrate-sdk/server";
import { convertToModelMessages, stepCountIs, streamText } from "ai";

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: "openai/gpt-5-mini",
        messages: convertToModelMessages(messages),
        tools: await getVercelAITools(serverClient),
        stopWhen: stepCountIs(5),
    });

    return result.toUIMessageStreamResponse();
}