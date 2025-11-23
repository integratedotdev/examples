"use client";

import { useState, useEffect } from "react";
import { client } from "integrate-sdk";

interface Repo {
  name?: string;
  full_name?: string;
  description?: string;
  html_url?: string;
}

export default function Home() {
  const [githubAuthorized, setGithubAuthorized] = useState(false);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [reposError, setReposError] = useState<string | null>(null);

  async function updateButtonStates(context = "unknown") {
    try {
      console.log(`[isAuthorized] Checking authorization status (context: ${context})...`);
      const authorized = await client.isAuthorized("github");
      console.log(`[isAuthorized] Result: ${authorized} (context: ${context})`);
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error(`[isAuthorized] Error checking authorization (context: ${context}):`, error);
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        console.log("[handleGithubClick] Disconnecting GitHub...");
        await client.disconnectProvider("github");
        console.log("[handleGithubClick] Disconnected, checking authorization status...");
        // Update state after disconnect
        await updateButtonStates("after-disconnect");
      } else {
        console.log("[handleGithubClick] Starting GitHub authorization...");
        // Note: authorize() will redirect to GitHub, so code after this won't execute
        // The useEffect will handle checking authorization when user returns
        await client.authorize("github");
        // This won't execute due to redirect, but kept for clarity
        console.log("[handleGithubClick] Authorization initiated (redirect happened)");
      }
    } catch (error) {
      console.error("[handleGithubClick] Error:", error);
    }
  }

  async function handleListRepos() {
    setLoadingRepos(true);
    setReposError(null);
    setRepos([]);

    try {
      const response = await client.github.listOwnRepos();

      // Extract repos from MCPToolCallResponse
      let extractedRepos: Repo[] = [];

      if (
        response.structuredContent &&
        Array.isArray(response.structuredContent)
      ) {
        extractedRepos = response.structuredContent as Repo[];
      } else if (response.content && response.content.length > 0) {
        // Try to parse JSON from text content
        const textContent = response.content[0]?.text;
        if (textContent) {
          try {
            const parsed = JSON.parse(textContent);
            extractedRepos = Array.isArray(parsed)
              ? parsed
              : parsed.repos || parsed.repositories || [];
          } catch {
            extractedRepos = [];
          }
        }
      }

      if (extractedRepos.length > 0) {
        setRepos(extractedRepos);
      } else {
        setReposError("No repositories found or unexpected response format.");
        console.log("Response:", response);
      }
    } catch (error) {
      console.error("Error listing repos:", error);
      setReposError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingRepos(false);
    }
  }

  useEffect(() => {
    // Initial auth check
    // client.isAuthorized() automatically waits for any pending OAuth callbacks
    console.log("[useEffect] Component mounted, checking initial authorization status...");
    updateButtonStates("initial-mount");

    // Also check when window gains focus (user returns from OAuth redirect)
    const handleFocus = () => {
      console.log("[useEffect] Window focused, checking authorization status...");
      updateButtonStates("window-focus");
    };

    window.addEventListener("focus", handleFocus);

    // Check authorization status after a short delay on mount
    // This helps catch the state change after OAuth callback completes
    const timeout = setTimeout(() => {
      console.log("[useEffect] Delayed check after mount, checking authorization status...");
      updateButtonStates("delayed-mount-check");
    }, 500); // Check after 500ms

    return () => {
      window.removeEventListener("focus", handleFocus);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      <button
        onClick={handleGithubClick}
        className="px-8 py-4 rounded-lg border-none bg-black text-white text-xl cursor-pointer"
      >
        {githubAuthorized ? "Disconnect Github" : "Connect Github"}
      </button>

      {githubAuthorized && (
        <div className="mt-8">
          <button
            onClick={handleListRepos}
            disabled={loadingRepos}
            className="px-8 py-4 rounded-lg border-none bg-black text-white text-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingRepos ? "Loading..." : "List All Repos"}
          </button>

          {reposError ? (
            <div className="mt-4 p-4 bg-[#f5f5f5] rounded-lg max-h-[400px] overflow-y-auto">
              <p>{reposError}</p>
            </div>
          ) : repos.length > 0 ? (
            <div className="mt-4 p-4 bg-[#f5f5f5] rounded-lg max-h-[400px] overflow-y-auto">
              <h3 className="mt-0">Repositories ({repos.length}):</h3>
              <ul className="list-none p-0">
                {repos.map((repo, index) => (
                  <li
                    key={index}
                    className="p-2 mb-2 bg-white rounded"
                  >
                    <strong>{repo.name || repo.full_name || "Unknown"}</strong>
                    {repo.description && (
                      <>
                        <br />
                        <small>{repo.description}</small>
                      </>
                    )}
                    {repo.html_url && (
                      <>
                        <br />
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#0066cc]"
                        >
                          View on GitHub
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}
