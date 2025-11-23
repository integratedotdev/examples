<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { client } from 'integrate-sdk';

  let githubAuthorized = $state(false);
  let repos = $state<any[]>([]);
  let loadingRepos = $state(false);
  let reposError = $state<string | null>(null);

  async function updateButtonStates() {
    try {
      githubAuthorized = await client.isAuthorized('github');
    } catch (error) {
      console.error('Error checking authorization:', error);
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        await client.disconnectProvider('github');
      } else {
        await client.authorize('github');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function handleListRepos() {
    loadingRepos = true;
    reposError = null;
    repos = [];

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
        repos = extractedRepos;
      } else {
        reposError = 'No repositories found or unexpected response format.';
        console.log('Response:', response);
      }
    } catch (error) {
      console.error('Error listing repos:', error);
      reposError = error instanceof Error ? error.message : String(error);
    } finally {
      loadingRepos = false;
    }
  }

  onMount(() => {
    // Setup event listeners for automatic state updates
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

    // Initial auth check
    updateButtonStates();

    return () => {
      client.off('auth:complete', handleAuthComplete);
      client.off('auth:error', handleAuthError);
      client.off('auth:disconnect', handleAuthDisconnect);
    };
  });
</script>

<button
  class="btn"
  data-authorized={githubAuthorized}
  onclick={handleGithubClick}
>
  {githubAuthorized ? 'Disconnect Github' : 'Connect Github'}
</button>

{#if githubAuthorized}
  <div class="repos-section">
    <button class="btn" onclick={handleListRepos} disabled={loadingRepos}>
      {loadingRepos ? 'Loading...' : 'List All Repos'}
    </button>

    {#if reposError}
      <div class="repos-output">
        <p>{reposError}</p>
      </div>
    {:else if repos.length > 0}
      <div class="repos-output">
        <h3>Repositories ({repos.length}):</h3>
        <ul>
          {#each repos as repo}
            <li>
              <strong>{repo.name || repo.full_name || 'Unknown'}</strong>
              {#if repo.description}
                <br />
                <small>{repo.description}</small>
              {/if}
              {#if repo.html_url}
                <br />
                <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                  View on GitHub
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
{/if}

<style>
  .repos-section {
    margin-top: 2rem;
  }

  .repos-output {
    margin-top: 1rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 0.5rem;
    max-height: 400px;
    overflow-y: auto;
  }

  .repos-output h3 {
    margin-top: 0;
  }

  .repos-output ul {
    list-style: none;
    padding: 0;
  }

  .repos-output li {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: white;
    border-radius: 0.25rem;
  }

  .repos-output a {
    color: #0066cc;
  }
</style>
