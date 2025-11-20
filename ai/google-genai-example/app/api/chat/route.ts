import { serverClient } from '@/lib/integrate';
import { GoogleGenAI } from '@google/genai'
import { executeGoogleFunctionCalls, getGoogleTools } from 'integrate-sdk/server';

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

export async function POST(req: Request) {
    const { messages } = await req.json();

    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: messages,
        config: {
            tools: [{ functionDeclarations: await getGoogleTools(serverClient) }],
        },
    });

    if (response.functionCalls && response.functionCalls.length > 0) {
        const results = await executeGoogleFunctionCalls(serverClient, response.functionCalls);
        return Response.json(results);
    }

    return Response.json(response);
}