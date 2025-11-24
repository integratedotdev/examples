import { createSignal, onMount, onCleanup } from "solid-js";
import { client } from "integrate-sdk";

export default function Home() {
  const [githubAuthorized, setGithubAuthorized] = createSignal(false);
  const [repos, setRepos] = createSignal<any[]>([]);
  const [loadingRepos, setLoadingRepos] = createSignal(false);
  const [reposError, setReposError] = createSignal<string | null>(null);

  async function updateButtonStates(context = 'unknown') {
    try {
      const authorized = await client.isAuthorized('github');
      setGithubAuthorized(authorized);
    } catch (error) {
      console.error(`[updateButtonStates] Error checking authorization (context: ${context}):`, error);
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized()) {
        await client.disconnectProvider('github');
        await updateButtonStates('after-disconnect');
      } else {
        await client.authorize('github');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleListRepos() {
    setLoadingRepos(true);
    setReposError(null);
    setRepos([]);

    try {
      const response = await client.github.listOwnRepos();

      // Extract repos from MCPToolCallResponse
      let extractedRepos: any[] = [];

      if (
        response.structuredContent &&
        Array.isArray(response.structuredContent)
      ) {
        extractedRepos = response.structuredContent as any[];
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
        setReposError('No repositories found or unexpected response format.');
        console.log('Response:', response);
      }
    } catch (error) {
      console.error('Error listing repos:', error);
      setReposError(error instanceof Error ? error.message : String(error));
    } finally {
      setLoadingRepos(false);
    }
  }

  onMount(() => {
    // Initial auth check
    updateButtonStates('initial-mount');

    const handleFocus = () => {
      updateButtonStates('window-focus');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    const timeout = setTimeout(() => {
      updateButtonStates('delayed-mount-check');
    }, 500);

    onCleanup(() => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
      clearTimeout(timeout);
    });
  });

  return (
    <>
      <button onClick={handleGithubClick}>
        {githubAuthorized() ? 'Disconnect Github' : 'Connect Github'}
      </button>

      {githubAuthorized() && (
        <div class="repos-section">
          <button onClick={handleListRepos} disabled={loadingRepos()}>
            {loadingRepos() ? 'Loading...' : 'List All Repos'}
          </button>

          {reposError() ? (
            <div class="repos-output">
              <p>{reposError()}</p>
            </div>
          ) : repos().length > 0 ? (
            <div class="repos-output">
              <h3>Repositories ({repos().length}):</h3>
              <ul>
                {repos().map((repo) => (
                  <li>
                    <strong>{repo.name || repo.full_name || 'Unknown'}</strong>
                    {repo.description && (
                      <>
                        <br />
                        <small>{repo.description}</small>
                      </>
                    )}
                    {repo.html_url && (
                      <>
                        <br />
                        <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
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
