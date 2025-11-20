import { serverClient } from "@/lib/integrate";
import { getOpenAITools, handleOpenAIResponse } from "integrate-sdk/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
    const { messages } = await req.json();

    const response = await openai.responses.create({
        model: "gpt-5-nano",
        input: messages,
        tools: await getOpenAITools(serverClient),
    });

    const result = await handleOpenAIResponse(serverClient, response);

    return Response.json(result);
}