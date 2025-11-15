import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { client } from '../lib/integrate'

export const Route = createFileRoute('/')({ component: App })

interface Repo {
  name?: string
  full_name?: string
  description?: string
  html_url?: string
}

function App() {
  const [githubAuthorized, setGithubAuthorized] = useState(false)
  const [repos, setRepos] = useState<Repo[]>([])
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [reposError, setReposError] = useState<string | null>(null)

  async function updateButtonStates() {
    try {
      const authorized = await client.isAuthorized('github')
      setGithubAuthorized(authorized)
    } catch (error) {
      console.error('Error checking authorization:', error)
    }
  }

  async function handleGithubClick() {
    try {
      if (githubAuthorized) {
        await client.disconnectProvider('github')
      } else {
        await client.authorize('github')
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleListRepos() {
    setLoadingRepos(true)
    setReposError(null)
    setRepos([])

    try {
      const response = await client.github.listOwnRepos()

      // Extract repos from MCPToolCallResponse
      let extractedRepos: Repo[] = []

      if (
        response.structuredContent &&
        Array.isArray(response.structuredContent)
      ) {
        extractedRepos = response.structuredContent as Repo[]
      } else if (response.content && response.content.length > 0) {
        // Try to parse JSON from text content
        const textContent = response.content[0]?.text
        if (textContent) {
          try {
            const parsed = JSON.parse(textContent)
            extractedRepos = Array.isArray(parsed)
              ? parsed
              : parsed.repos || parsed.repositories || []
          } catch {
            extractedRepos = []
          }
        }
      }

      if (extractedRepos.length > 0) {
        setRepos(extractedRepos)
      } else {
        setReposError('No repositories found or unexpected response format.')
        console.log('Response:', response)
      }
    } catch (error) {
      console.error('Error listing repos:', error)
      setReposError(error instanceof Error ? error.message : String(error))
    } finally {
      setLoadingRepos(false)
    }
  }

  useEffect(() => {
    // Setup event listeners for automatic state updates
    const handleAuthComplete = () => {
      updateButtonStates()
    }

    const handleAuthError = ({ error }: { provider: string; error: Error }) => {
      console.error('Auth error:', error)
    }

    const handleAuthDisconnect = () => {
      updateButtonStates()
    }

    client.on('auth:complete', handleAuthComplete)
    client.on('auth:error', handleAuthError)
    client.on('auth:disconnect', handleAuthDisconnect)

    // Initial auth check
    updateButtonStates()

    return () => {
      client.off('auth:complete', handleAuthComplete)
      client.off('auth:error', handleAuthError)
      client.off('auth:disconnect', handleAuthDisconnect)
    }
  }, [])

  return (
    <>
      <button
        onClick={handleGithubClick}
        className="px-8 py-4 rounded-lg border-none bg-black text-white text-xl cursor-pointer"
      >
        {githubAuthorized ? 'Disconnect Github' : 'Connect Github'}
      </button>

      {githubAuthorized && (
        <div className="mt-8">
          <button
            onClick={handleListRepos}
            disabled={loadingRepos}
            className="px-8 py-4 rounded-lg border-none bg-black text-white text-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingRepos ? 'Loading...' : 'List All Repos'}
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
                  <li key={index} className="p-2 mb-2 bg-white rounded">
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
  )
}
