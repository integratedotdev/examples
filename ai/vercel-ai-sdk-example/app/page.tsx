'use client';

import { useChat } from '@ai-sdk/react';
import { Streamdown } from 'streamdown';
import { useState, useEffect } from 'react';
import { client } from 'integrate-sdk';

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');

  const [githubAuthorized, setGithubAuthorized] = useState(false);

  const isLoading = status === 'streaming';

  async function updateButtonStates(context = "unknown") {
    try {
      const authorized = await client.isAuthorized("github");
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error(`[updateButtonStates] Error checking authorization (context: ${context}):`, error);
    }
  }

  async function handleGithubClick() {
    if (githubAuthorized) {
      await client.disconnectProvider("github");
      await updateButtonStates("after-disconnect");
    } else {
      await client.authorize("github");
    }
  }

  useEffect(() => {
    updateButtonStates("initial-mount");

    const handleFocus = () => {
      updateButtonStates("window-focus");
    };

    window.addEventListener("focus", handleFocus);

    const timeout = setTimeout(() => {
      updateButtonStates("delayed-mount-check");
    }, 500);

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={message.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div className="inline-block max-w-2xl">
              <Streamdown isAnimating={isLoading && message.role === 'assistant'}>
                {message.parts
                  .filter((part) => part.type === 'text')
                  .map((part) => 'text' in part ? part.text : '')
                  .join('')}
              </Streamdown>
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage({ text: input });
            setInput('');
          }
        }}
        className="p-4 border-t border-gray-500 space-y-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full px-4 py-2 border border-gray-500 rounded-lg"
          disabled={isLoading}
        />
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleGithubClick}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            {githubAuthorized ? 'Disconnect' : 'Connect'} GitHub
          </button>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-black text-white rounded-lg disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}