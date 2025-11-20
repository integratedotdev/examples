"use client";

import { useState, useEffect } from "react";
import { client } from "integrate-sdk";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [githubAuthorized, setGithubAuthorized] = useState(false);

  const isLoading = loading;

  async function updateButtonStates() {
    try {
      const authorized = await client.isAuthorized("github");
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error("Error checking authorization:", error);
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
      console.error("Auth error:", error);
    };

    const handleAuthDisconnect = () => {
      updateButtonStates();
    };

    client.on("auth:complete", handleAuthComplete);
    client.on("auth:error", handleAuthError);
    client.on("auth:disconnect", handleAuthDisconnect);

    queueMicrotask(() => void updateButtonStates());

    return () => {
      client.off("auth:complete", handleAuthComplete);
      client.off("auth:error", handleAuthError);
      client.off("auth:disconnect", handleAuthDisconnect);
    };
  }, []);

  function formatFunctionOutput(output: unknown): string {
    try {
      // Parse if it's a string
      const data = typeof output === "string" ? JSON.parse(output) : output;

      // Check for structured content with repositories
      if (data.structuredContent?.repositories) {
        let displayText = "\n\n📦 **GitHub Repositories:**\n\n";
        for (const repo of data.structuredContent.repositories) {
          displayText += `**${repo.name}**\n`;
          displayText += `${repo.html_url}\n`;
          if (repo.description) {
            displayText += `_${repo.description}_\n`;
          }
          displayText += `Language: ${repo.language || "N/A"} • Stars: ${repo.stargazers_count} • ${repo.private ? "Private" : "Public"}\n\n`;
        }
        return displayText;
      }

      // Check for content array
      if (data.content && Array.isArray(data.content)) {
        let text = "";
        for (const item of data.content) {
          if (item.type === "text" && item.text) {
            // Try to parse the text as JSON if it looks like JSON
            try {
              const parsed = JSON.parse(item.text);
              if (parsed.repositories) {
                let repoText = "\n\n📦 **GitHub Repositories:**\n\n";
                for (const repo of parsed.repositories) {
                  repoText += `**${repo.name}**\n`;
                  repoText += `${repo.html_url}\n`;
                  if (repo.description) {
                    repoText += `_${repo.description}_\n`;
                  }
                  repoText += `Language: ${repo.language || "N/A"} • Stars: ${repo.stargazers_count} • ${repo.private ? "Private" : "Public"}\n\n`;
                }
                text += repoText;
              } else {
                text += JSON.stringify(parsed, null, 2);
              }
            } catch {
              text += item.text;
            }
          }
        }
        return text;
      }

      // Fallback to stringifying the data
      return JSON.stringify(data, null, 2);
    } catch (e) {
      console.error("Error formatting function output:", e);
      return String(output);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Convert messages to Google Genai format
      const googleMessages = [...messages, userMessage].map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: googleMessages,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Build the assistant's response
      let assistantContent = "";

      // Handle Google Genai response format
      if (result.structuredContent) {
        // Function call result with structuredContent (not an array)
        assistantContent = formatFunctionOutput(result);
      } else if (result.text) {
        // Simple text response
        assistantContent = result.text;
      } else if (result.candidates && result.candidates[0]?.content) {
        // Structured response with candidates
        const content = result.candidates[0].content;
        if (content.parts) {
          for (const part of content.parts) {
            if (part.text) {
              assistantContent += part.text;
            }
          }
        }
      } else if (Array.isArray(result)) {
        // Handle function call results (array format)
        for (const item of result) {
          // If item is a string, try to parse it as JSON first
          if (typeof item === "string") {
            try {
              const parsed = JSON.parse(item);
              if (parsed.structuredContent) {
                assistantContent += formatFunctionOutput(parsed);
              } else {
                assistantContent += item;
              }
            } catch {
              // Not JSON, just use as plain text
              assistantContent += item;
            }
          }
          // Check if item has structuredContent directly (Google format)
          else if (item.structuredContent) {
            assistantContent += formatFunctionOutput(item);
          } else if (item.type === "function_call_output") {
            assistantContent += formatFunctionOutput(item.output);
          } else if (item.content && Array.isArray(item.content)) {
            // Handle content array format
            for (const contentItem of item.content) {
              if (contentItem.text) {
                assistantContent += formatFunctionOutput(contentItem.text);
              }
            }
          }
        }
      }

      // If no content was found, show the raw result
      if (!assistantContent.trim()) {
        assistantContent = "Response received but no displayable content found.";
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent.trim() },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Error: ${error instanceof Error ? error.message : "Unknown error"}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <Streamdown
              isAnimating={isLoading && m.role === 'assistant' && i === messages.length - 1}
              className="inline-block max-w-2xl whitespace-pre-wrap"
            >
              {m.content}
            </Streamdown>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-500 space-y-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI anything..."
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