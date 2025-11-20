"use client";

import { useState, useEffect } from "react";
import { client } from "integrate-sdk";
import Anthropic from "@anthropic-ai/sdk";
import { Streamdown } from 'streamdown';

export default function ChatPage() {
  const [messages, setMessages] = useState<Anthropic.MessageParam[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubAuthorized, setGithubAuthorized] = useState(false);

  async function updateButtonStates() {
    try {
      const authorized = await client.isAuthorized('github');
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error('Error checking authorization:', error);
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        await client.disconnectProvider("github");
      } else {
        await client.authorize("github");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  }

  useEffect(() => {
    const handleAuthComplete = () => {
      updateButtonStates();
    };

    const handleAuthError = ({ error }: { provider: string; error: Error }) => {
      console.error('Auth error:', error);
    };

    const handleAuthDisconnect = () => {
      updateButtonStates();
    };

    client.on('auth:complete', handleAuthComplete);
    client.on('auth:error', handleAuthError);
    client.on('auth:disconnect', handleAuthDisconnect);

    queueMicrotask(() => void updateButtonStates());

    return () => {
      client.off('auth:complete', handleAuthComplete);
      client.off('auth:error', handleAuthError);
      client.off('auth:disconnect', handleAuthDisconnect);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Anthropic.MessageParam = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();

      // The backend might return a single message or an array of messages (if tool calls happened)
      const newMessages = Array.isArray(data) ? data : [data];

      setMessages((prev) => [
        ...prev,
        ...newMessages.map((msg: Anthropic.MessageParam) => ({
          role: msg.role,
          content: msg.content
        }))
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const renderContent = (content: Anthropic.MessageParam["content"], isAssistant: boolean) => {
    if (typeof content === "string") {
      if (isAssistant) {
        return <Streamdown isAnimating={loading}>{content}</Streamdown>;
      }
      return <div className="whitespace-pre-wrap">{content}</div>;
    }

    if (Array.isArray(content)) {
      return (
        <div className="space-y-2">
          {content.map((block, index) => {
            if (block.type === "text") {
              if (isAssistant) {
                return <Streamdown key={index} isAnimating={loading}>{block.text}</Streamdown>;
              }
              return <div key={index} className="whitespace-pre-wrap">{block.text}</div>;
            }
            // Filter out intermediate tool usage blocks to keep UI clean
            if (block.type === "tool_use") {
              return null;
            }
            // Render tool results as normal messages
            if (block.type === "tool_result") {
              let displayContent = block.content;

              // Attempt to parse JSON content to see if it has a nested "content" array or text field
              if (typeof block.content === 'string') {
                try {
                  const parsed = JSON.parse(block.content);
                  // Check if it matches the structure in the user's example
                  if (parsed.content && Array.isArray(parsed.content)) {
                    return (
                      <div key={index} className="space-y-2">
                        {parsed.content.map((innerBlock: { type: string; text: string }, innerIndex: number) => {
                          if (innerBlock.type === 'text') {
                            return <div key={innerIndex} className="whitespace-pre-wrap">{innerBlock.text}</div>;
                          }
                          return null;
                        })}
                      </div>
                    );
                  }
                  // If it's just a JSON object/array, prettify it
                  displayContent = JSON.stringify(parsed, null, 2);
                } catch {
                  // Keep as string if not JSON
                }
              }

              // Fallback for simple string or unparsed content
              return <div key={index} className="whitespace-pre-wrap">{typeof displayContent === 'string' ? displayContent : JSON.stringify(displayContent)}</div>;
            }
            return null;
          })}
        </div>
      );
    }

    return JSON.stringify(content);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => {
          // If content is just tool usage and we are hiding it, we might render empty bubbles.
          // We need to check if there's any renderable content.
          let hasRenderableContent = false;
          let isToolResult = false;

          if (typeof m.content === 'string') hasRenderableContent = true;
          else if (Array.isArray(m.content)) {
            hasRenderableContent = m.content.some(block =>
              block.type === 'text' || block.type === 'tool_result'
            );
            // Check if this is a tool result message to adjust alignment
            isToolResult = m.content.some(block => block.type === 'tool_result');
          }

          if (!hasRenderableContent) return null;

          // If it's a tool result, align left (like assistant), otherwise align based on role
          const alignmentClass = (m.role === 'user' && !isToolResult) ? 'text-right' : 'text-left';

          return (
            <div
              key={i}
              className={alignmentClass}
            >
              <div className="inline-block max-w-2xl">
                {renderContent(m.content, m.role === 'assistant' || isToolResult)}
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-500 space-y-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Claude anything..."
          className="w-full px-4 py-2 border border-gray-500 rounded-lg"
          disabled={loading}
        />
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleGithubClick}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {githubAuthorized ? "Disconnect" : "Connect"} GitHub
          </button>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
