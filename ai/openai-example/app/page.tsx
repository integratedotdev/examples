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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Build the assistant's response from the output
      let assistantContent = "";

      // Handle if result is an array directly
      const outputArray = Array.isArray(result) ? result : result.output;

      if (outputArray && Array.isArray(outputArray)) {
        for (const item of outputArray) {
          if (item.type === "message" && item.content) {
            // Extract text from message content
            for (const content of item.content) {
              // Handle both "text" and "output_text" content types
              if (content.type === "text" || content.type === "output_text") {
                assistantContent += content.text + "\n";
              }
            }
          } else if (item.type === "function_call") {
            assistantContent += `🔧 Called function: ${item.name}\n`;
          } else if (item.type === "function_call_output") {
            // Format the function output nicely
            assistantContent += formatFunctionOutput(item.output);
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